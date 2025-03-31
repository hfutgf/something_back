import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateVideoDto {
  @ApiProperty({ description: 'Title of the video', example: 'My Video' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title?: string;

  @ApiProperty({
    description: 'Description of the video',
    example: 'This is a great video',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Video file' })
  video?: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Cover image file',
  })
  cover?: any;
}

export class UpdateOnlyVideoDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Video file' })
  video?: any;
}

export class UpdateOnlyCoverDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Cover image file',
  })
  cover?: any;
}

export class UpdateOtherDto {
  @ApiProperty({ description: 'Title of the video', example: 'My Video' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title?: string;

  @ApiProperty({
    description: 'Description of the video',
    example: 'This is a great video',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;
}
