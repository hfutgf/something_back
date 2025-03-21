import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { CredentialLoginDto } from './dto/credential-login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private user: UserService,
    private jwt: JwtService,
  ) {}

  async registerCredential(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.user.getUserByUsername(dto.username);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await argon2.hash(dto.password);

    const parsedDate = dto.birthday ? new Date(dto.birthday) : null;

    return await this.user.createUser({
      ...dto,
      password: hashPassword,
      birthday: parsedDate,
    });
  }

  async googleAuth(
    dto: GoogleAuthDto,
  ): Promise<{ user: User; accessToken: string }> {
    let user = await this.user.getByGoogleId(dto.googleId);
    if (!user) {
      user = await this.user.createUser(dto);
    }

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, username: user.email },
      { expiresIn: '1d', secret: process.env.JWT_SECRET },
    );

    return { user, accessToken };
  }

  async loginCredential(
    dto: CredentialLoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.user.getUserByUsername(dto.username);

    if (!user) throw new NotFoundException(`Username or password is wrong!`);

    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username or password is wrong!');
    }

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: '1d', secret: process.env.JWT_SECRET },
    );

    return { user, accessToken };
  }

  async validateUser(userId: string) {
    const user = await this.user.getById(userId);
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    return user;
  }
}
