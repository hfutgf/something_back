import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoService } from './video.service';

@ApiTags('Videos')
@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload video and cover',
    type: CreateVideoDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder = file.fieldname === 'video' ? 'videos' : 'covers';
            const path = `./public/uploads/${folder}`;
            fs.mkdirSync(path, { recursive: true });
            cb(null, path);
          },
          filename: (req, file, cb) => {
            const randomName = uuidv4();
            const ext = extname(file.originalname);
            cb(null, `${randomName}${ext}`);
          },
        }),
      },
    ),
  )
  async createVideo(
    @CurrentUser() user: User,
    @Body() dto: CreateVideoDto,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    if (!files.video?.length) {
      throw new Error('Video is required');
    }

    if (!files.cover?.length) {
      throw new Error('Cover image is required');
    }

    const baseUrl = process.env.SERVER_URL;
    const videoUrl = `${baseUrl}${files.video[0].path.replace('public', '')}`;
    const coverUrl = `${baseUrl}${files.cover[0].path.replace('public', '')}`;

    const video = await this.videoService.create(user, {
      ...dto,
      link: videoUrl,
      cover: coverUrl,
    });

    return video;
  }
}
