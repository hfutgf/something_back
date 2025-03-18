import { IsOptional, IsString, MinLength } from 'class-validator';

export class CredentialLoginDto {
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
