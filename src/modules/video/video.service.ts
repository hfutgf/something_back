import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, Video } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async create(
    user: User,
    dto: Omit<CreateVideoDto, 'video'> & { link: string },
  ): Promise<Video> {
    try {
      return await this.prisma.video.create({
        data: {
          ...dto,
          userId: user.id,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }
  }

  async updateFromCreator(
    user: User,
    videoId: string,
    dto: Omit<UpdateVideoDto, 'video'> & { link?: string },
  ): Promise<Video> {
    try {
      const video = await this.prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new NotFoundException('Video not found');
      }

      if (video.userId !== user.id) {
        throw new ConflictException('You are not the creator of this video');
      }

      return await this.prisma.video.update({
        where: { id: videoId },
        data: dto,
      });
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  async updateFromViewer(videoId: string): Promise<Video> {
    try {
      return await this.prisma.video.update({
        where: { id: videoId },
        data: {
          views: { increment: 1 },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Video not found');
      }
      throw new Error(`Failed to increment video views: ${error.message}`);
    }
  }
}
