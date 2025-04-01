import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { existsSync, mkdirSync, promises as fs } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommonService } from '../common/common.service';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly uploadDir = join(process.cwd(), 'public', 'avatars');
  private get baseUrl() {
    return process.env.SERVER_URL;
  }

  constructor(
    private readonly userService: UserService,
    private readonly commonService: CommonService,
  ) {
    this.createUploadDir();
  }

  private createUploadDir() {
    try {
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Could not initialize upload folder: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieves detailed information about a specific user by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User found and returned successfully',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  async getById(@Param('id') id: string): Promise<ResponseUserDto> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userService.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'public', 'avatars');
          if (!existsSync(uploadDir)) {
            return cb(new Error('Upload directory not available'), null);
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {},
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: ResponseUserDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/*' })],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<ResponseUserDto> {
    try {
      const avatarPath = file
        ? `${this.baseUrl}/avatars/${file.filename}`
        : undefined;
      const updatedUser = await this.userService.updateUser(
        userId,
        dto,
        avatarPath,
      );

      return updatedUser;
    } catch (error) {
      if (file?.path && existsSync(file.path)) {
        await fs.unlink(file.path).catch((err) => {
          throw err;
        });
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
