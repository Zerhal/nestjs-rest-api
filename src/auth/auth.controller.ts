import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Prisma, Roles as Role } from '@prisma/client';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user and obtain JWT token.',
  })
  @ApiBody({
    description: 'User credentials for login.',
    examples: {
      'application/json': {
        value: {
          email: 'user@example.com',
          password: 'yourPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated and JWT token generated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  /**
   * signIn function for user authentication.
   *
   * @param {LoginDto} signInDto - object containing user email and password
   * @return {type} returns the result of the authentication process
   */
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({
    summary: 'User Registration',
    description: 'Create new user and obtain JWT token.',
  })
  @ApiBody({
    description: 'User credentials for registration.',
    examples: {
      'application/json': {
        value: {
          email: 'user@example.com',
          password: 'yourPassword123',
          confirm: 'yourPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered and JWT token generated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid credentials.',
  })
  register(@Body() data: RegisterDto) {
    const { confirm, ...rest } = data;
    return this.authService.register(rest as Prisma.UserCreateInput, confirm);
  }

  @Roles(Role.User)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return this.authService.profile(req.user.sub);
  }
}
