import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

import { CommonService } from '../common/common.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    return user;
  }

  async getByGoogleId(googleId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { googleId } });

    return user;
  }

  async getById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({ data: dto });
    return user;
  }
  async updateUser(userId: string, dto: UpdateUserDto, avatarPath?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (avatarPath && user.avatar) {
      await this.commonService.deleteFile(user.avatar);
    }

    let password = user.password;

    if (dto.password) {
      password = await argon2.hash(dto.password);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        password: password,
        ...(avatarPath && { avatar: avatarPath }),
      },
    });
  }

  async deleteUser(userId: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar) {
      await this.commonService.deleteFile(user.avatar);
    }
    return user;
  }
}
