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

  async delete(user: User, videoId: string): Promise<string> {
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

      await this.prisma.video.delete({
        where: { id: videoId },
      });

      return `Video with ID: ${videoId} removed`;
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  async getOneVideo(videoId: string): Promise<Video | null> {
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { user: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async getByUserId(
    userId: string,
    options?: { skip?: number; take?: number },
  ): Promise<Video[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.prisma.video.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take || 20,
    });
  }

  async searchVideo(
    value: string,
    options?: { skip?: number; take?: number },
  ): Promise<Video[]> {
    return await this.prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: value, mode: 'insensitive' } },
          { description: { contains: value, mode: 'insensitive' } },
          { user: { firstName: { contains: value, mode: 'insensitive' } } },
          { user: { lastName: { contains: value, mode: 'insensitive' } } },
        ],
      },
      include: { user: true },
      orderBy: {
        views: 'desc',
      },
      skip: options?.skip,
      take: options?.take || 20,
    });
  }
}
