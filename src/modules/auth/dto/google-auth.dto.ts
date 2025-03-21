import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsOptional()
  @IsString({ message: 'Google ID must be a string' })
  googleId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'First name is required' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  birthday?: Date;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar?: string;
}
