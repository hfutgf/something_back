import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ResponseUserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique user identifier',
  })
  id: string;

  @ApiProperty({
    example: '2024-03-18T12:00:00.000Z',
    description: 'User creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-03-18T12:30:00.000Z',
    description: 'User last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: '12345678901234567890',
    description: 'Google OAuth identifier',
    nullable: true,
  })
  googleId?: string | null;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email address',
    nullable: true,
  })
  email?: string | null;

  @ApiPropertyOptional({
    example: 'username123',
    description: 'Unique username',
    nullable: true,
  })
  username?: string | null;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName: string;

  @ApiPropertyOptional({
    example: '2000-01-01',
    description: 'User birth date in YYYY-MM-DD format',
    nullable: true,
  })
  @Transform(({ value }) => value?.toISOString().split('T')[0])
  birthday?: Date | null;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'URL to user avatar image',
    nullable: true,
  })
  avatar?: string | null;
}
