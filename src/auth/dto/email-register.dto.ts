import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true, default: 'demo@gmail.com' })
  email: string;
}

export class EmailLoginDto extends EmailDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ required: false, default: 'password123', minimum: 6 })
  password: string;
}
export class EmailRegisterDto extends EmailLoginDto {
  @IsNotEmpty()
  @ApiProperty({ required: false, default: 'demo' })
  @IsString()
  @Min(3)
  name: string;
}

export class ForgotPasswordDto extends EmailLoginDto {
  @IsNotEmpty()
  @ApiProperty({ required: false, default: '3204' })
  @IsString()
  @Min(4)
  @Max(4)
  code: string;
}

export class EmailVerifyDto extends EmailDto {
  @IsNotEmpty()
  @ApiProperty({ required: false, default: '3203' })
  @IsString()
  @Min(4)
  @Max(4)
  code: string;
}
