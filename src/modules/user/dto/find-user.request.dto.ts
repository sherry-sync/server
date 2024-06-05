import { IsEmail, IsOptional, IsString } from 'class-validator';

export class FindUserDto {
  @IsOptional()
  @IsString()
    username: string;

  @IsOptional()
  @IsEmail()
    email: string;

  @IsOptional()
  @IsString()
    userId: string;
}
