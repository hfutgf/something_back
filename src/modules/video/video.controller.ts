import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User, Video } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import {
  UpdateOnlyCoverDto,
  UpdateOnlyVideoDto,
  UpdateOtherDto,
  UpdateVideoDto,
} from './dto/update-video.dto';
import { VideoResponseDto } from './dto/video-response.dto';
import { fileUtils } from './utils/check-file-type';
import { VideoService } from './video.service';

@ApiTags('Videos')
@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  private get baseUrl() {
    return process.env.SERVER_URL;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Video ID' })
  @ApiResponse({
    status: 200,
    description: 'Video found',
    type: VideoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async getOneVideo(@Param('id') videoId: string): Promise<Video> {
    return this.videoService.getOneVideo(videoId);
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get videos by user ID' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: false,
    description: 'Items per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of videos',
    type: [VideoResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  async getByUserId(
    @Param('userId') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<Video[]> {
    return this.videoService.getByUserId(userId, { skip, take });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search videos by keyword' })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: false,
    description: 'Items per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching videos',
    type: [VideoResponseDto],
  })
  async searchVideo(
    @Query('query') query: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<Video[]> {
    if (!query) throw new NotFoundException('Search query is required');
    return this.videoService.searchVideo(query, { skip, take });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload video and cover', type: CreateVideoDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: fileUtils.storage('videos'),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'video') {
            return fileUtils.fileFilter({
              fieldName: 'video',
              mimeTypes: ['video/mp4', 'video/quicktime'],
              extensions: ['.mp4', '.mov'],
            })(req, file, cb);
          } else if (file.fieldname === 'cover') {
            return fileUtils.fileFilter({
              fieldName: 'cover',
              mimeTypes: ['image/jpeg', 'image/png'],
              extensions: ['.jpg', '.jpeg', '.png'],
            })(req, file, cb);
          }
          cb(new BadRequestException('Invalid field name'), false);
        },
      },
    ),
  )
  async createVideo(
    @CurrentUser() user: User,
    @Body() dto: CreateVideoDto,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    if (!files.video?.length)
      throw new BadRequestException('Video is required');
    if (!files.cover?.length)
      throw new BadRequestException('Cover is required');

    return this.videoService.create(user, {
      ...dto,
      link: fileUtils.generateFileUrl(files.video[0], process.env.SERVER_URL),
      cover: fileUtils.generateFileUrl(files.cover[0], process.env.SERVER_URL),
    });
  }

  @Put(':id/video')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update video file (creator only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload video', type: UpdateOnlyVideoDto })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'video', maxCount: 1 }], {
      storage: fileUtils.storage('videos'),
      fileFilter: fileUtils.fileFilter({
        fieldName: 'video',
        mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
        extensions: ['.mp4', '.mov', '.avi'],
      }),
    }),
  )
  async updateVideoFile(
    @CurrentUser() user: User,
    @Param('id') videoId: string,
    @UploadedFiles() files: { video?: Express.Multer.File[] },
  ) {
    if (!files.video?.[0]) {
      throw new BadRequestException('Video file is required');
    }

    return this.videoService.updateFromCreator(user, videoId, {
      link: fileUtils.generateFileUrl(files.video[0], process.env.SERVER_URL),
    });
  }

  @Put(':id/cover')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update video cover image (creator only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload cover', type: UpdateOnlyCoverDto })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }], {
      storage: fileUtils.storage('covers'),
      fileFilter: fileUtils.fileFilter({
        fieldName: 'cover',
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        extensions: ['.jpg', '.jpeg', '.png', '.webp'],
      }),
    }),
  )
  async updateCover(
    @CurrentUser() user: User,
    @Param('id') videoId: string,
    @UploadedFiles() files: { cover?: Express.Multer.File[] },
  ) {
    if (!files.cover?.[0]) {
      throw new BadRequestException('Cover image is required');
    }

    return this.videoService.updateFromCreator(user, videoId, {
      cover: fileUtils.generateFileUrl(files.cover[0], process.env.SERVER_URL),
    });
  }

  @Put(':id/views')
  @ApiOperation({ summary: 'Increment video view count' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async incrementViews(@Param('id') videoId: string) {
    const updatedVideo = await this.videoService.updateFromViewer(videoId);
    if (!updatedVideo) {
      throw new NotFoundException('Видео не найдено');
    }
    return updatedVideo;
  }

  @Put(':id/other')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update video title and description' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiBody({
    description: 'Update title and desc',
    type: UpdateOtherDto,
  })
  @ApiResponse({ status: 200, description: 'Video updated' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async otherUpdate(
    @CurrentUser() user: User,
    @Param('id') videoId: string,
    @Body() dto: Omit<UpdateVideoDto, 'video'> & { link?: string },
  ) {
    return this.videoService.updateFromCreator(user, videoId, {
      ...dto,
      link: dto.link ?? undefined,
    });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a video (creator only)' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video deleted' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async deleteVideo(@CurrentUser() user: User, @Param('id') videoId: string) {
    return this.videoService.delete(user, videoId);
  }
}
