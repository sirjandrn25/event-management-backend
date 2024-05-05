import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Min } from 'class-validator';

export class EmailRegisterDto {
  @IsNotEmpty()
  @ApiProperty({ required: false, default: 'demo' })
  @IsString()
  @Min(3)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: false, default: 'demo@gmail.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ required: false, default: 'password123', minimum: 6 })
  @IsString()
  @Min(6)
  password: string;
}
