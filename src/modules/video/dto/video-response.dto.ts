import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VideoResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the video',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Title of the video',
    example: 'Amazing Sunset in Hawaii',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the video',
    example: '4K footage of sunset at Waikiki Beach',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Date when video was created',
    example: '2023-07-15T14:32:00.000Z',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when video was last updated',
    example: '2023-07-16T09:15:23.000Z',
  })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({
    description: 'Video file URL',
    example: 'https://example.com/videos/sunset.mp4',
  })
  @IsString()
  videoUrl: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://example.com/covers/sunset.jpg',
  })
  @IsString()
  coverUrl: string;

  @ApiProperty({
    description: 'Number of views',
    example: 1500,
    default: 0,
  })
  views: number;

  @ApiProperty({
    description: 'User ID of the video owner',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  userId: string;
}
