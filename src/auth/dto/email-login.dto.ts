//src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EmailLoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: false, default: 'demo@gmail.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ required: false, default: 'password123', minimum: 6 })
  password: string;
}
