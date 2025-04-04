import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { AuthService } from './auth.service';
import { CredentialLoginDto } from './dto/credential-login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    schema: {
      example: {
        username: 'username',
        password: 'password123',
        firstName: 'first_name',
        lastName: 'last_name',
        birthday: new Date(),
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: { example: { user: ResponseUserDto, accessToken: 'token' } },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  async register(@Body() dto: CreateUserDto): Promise<User> {
    try {
      return await this.authService.registerCredential(dto);
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: { example: { username: 'username', password: 'password123' } },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: { example: { user: ResponseUserDto, accessToken: 'token' } },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Body() dto: CredentialLoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      const user = await this.authService.loginCredential(dto);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google authentication' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login via Google successful',
    schema: { example: { user: ResponseUserDto, accessToken: 'token' } },
  })
  async googleAuth(
    @Body() dto: GoogleAuthDto,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      return await this.authService.googleAuth(dto);
    } catch (error) {
      throw error;
    }
  }
}
