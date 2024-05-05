import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateChatDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: false, default: 'chat-one' })
  title: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true })
  is_group?: boolean;
}

export class CreateChatWithUserDto extends CreateChatDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  user_ids: string[];
}
