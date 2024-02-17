import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Tokens } from './models/tokens';
import { User } from '@prisma/client';

// Étendez l'interface Request pour inclure la propriété 'user'
interface RequestWithUser extends Request {
  user?: any; // Ajoutez ici le type de l'objet 'user' si nécessaire
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      request.user = payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        await this.handleExpiredToken(request);
        return true;
      } else {
        throw new UnauthorizedException('Access token is invalid');
      }
    }

    return true;
  }

  private async handleExpiredToken(request: RequestWithUser): Promise<void> {
    try {
      const refreshToken =
        await this.authService.getRefreshTokenFromAccessToken(
          request.headers.authorization.split(' ')[1]
        );

      const newAccessToken = await this.renewAccessToken(refreshToken);
      request.user = this.jwtService.decode(newAccessToken.accessToken);
    } catch (error) {
      console.error('Error handling expired token:', error); // Ajoutez cette ligne pour imprimer l'erreur
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  private async renewAccessToken(refreshToken: string): Promise<Tokens> {
    try {
      // Ajoutez ici la logique pour renouveler le token d'accès en utilisant le refreshToken
      // Ceci dépend de votre mise en œuvre, par exemple, vérifiez la validité du refreshToken,
      // récupérez les informations nécessaires et signez un nouveau token d'accès.

      // Exemple fictif :
      const user = await this.verifyRefreshToken(refreshToken);
      const newAccessToken = this.authService.createAccessToken(user);

      return {
        accessToken: newAccessToken.accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to renew access token');
    }
  }

  private async verifyRefreshToken(refreshToken: string): Promise<User> {
    try {
      const decodedToken = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.usersService.findOne({ id: decodedToken.sub });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
