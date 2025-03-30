import { Injectable } from '@nestjs/common';
import { User, Video } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async create(
    user: User,
    dto: Omit<CreateVideoDto, 'video'> & { link: string },
  ): Promise<Video> {
    try {
      return await this.prisma.video.create({
        data: { ...dto, user: { connect: { id: user.id } } },
      });
    } catch (error) {
      throw new Error('Failed to create video: ' + error.message);
    }
  }
}
