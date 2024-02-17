import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User, Prisma, Roles } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenPayload } from './models/tokenPayload';
import { Tokens } from './models/tokens';
import { UserProfile } from './models/userProfile';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  /**
   * Register a new user with the provided information and return tokens.
   *
   * @param {Prisma.UserCreateInput} userCreateInput - the input for creating a new user
   * @param {string} confirm - the confirmation password
   * @return {Promise<Tokens>} tokens containing access and refresh tokens
   */
  async register(
    userCreateInput: Prisma.UserCreateInput,
    confirm: string
  ): Promise<Tokens> {
    if (userCreateInput.password !== confirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersService.findBy({
      where: {
        email: userCreateInput.email,
      },
    });

    if (existingUser && existingUser.length > 0) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userCreateInput.password, 10);

    try {
      const createdUser = await this.usersService.create({
        ...userCreateInput,
        password: hashedPassword,
        roles: [Roles.User],
      });

      const refreshToken = this.createRefreshToken(createdUser);

      await this.usersService.update({
        where: {
          id: createdUser.id,
        },
        data: {
          refreshToken: refreshToken.refreshToken,
        },
      });

      const accessToken = this.createAccessToken(createdUser);

      return {
        accessToken: accessToken.accessToken,
        refreshToken: refreshToken.refreshToken,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async signIn(email: string, pass: string): Promise<Tokens> {
    const user = await this.usersService.findOne({ email: email });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }
    return {
      accessToken: this.createAccessToken(user).accessToken,
      refreshToken: this.createRefreshToken(user).refreshToken,
    };
  }

  private setPayload(user: User): TokenPayload {
    return {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000), // current time
      aud: 'proxy-farm',
    };
  }

  createAccessToken(user: User) {
    return {
      accessToken: this.jwtService.sign(this.setPayload(user), {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      }),
    };
  }

  private createRefreshToken(user: User) {
    return {
      refreshToken: this.jwtService.sign(this.setPayload(user), {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    };
  }

  async getRefreshTokenFromAccessToken(accessToken: string): Promise<string> {
    const sub = this.jwtService.decode(accessToken).sub;
    const user = await this.usersService.findOne({ id: sub });
    const refreshToken = user.refreshToken;
    return refreshToken;
  }

  /**
   * Retrieves the profile of a user by their UUID.
   *
   * @param {string} uuid - The UUID of the user
   * @return {Promise<UserProfile>} A promise that resolves with the user's profile
   */
  async profile(uuid: string): Promise<UserProfile> {
    const user = await this.usersService.findOne({ id: uuid });
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
