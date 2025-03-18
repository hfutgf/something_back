import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '2024-03-18T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-18T12:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '12345678901234567890', nullable: true })
  googleId?: string | null;

  @ApiProperty({ example: 'user@example.com', nullable: true })
  email?: string | null;

  @ApiProperty({ example: 'username123', nullable: true })
  username?: string | null;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '2000-01-01T00:00:00.000Z', nullable: true })
  birthday?: Date | null;

  @ApiProperty({ example: 'https://example.com/avatar.png', nullable: true })
  avatar?: string | null;
}
