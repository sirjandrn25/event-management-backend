import { IsNotEmpty, IsString } from 'class-validator';

export class ChatJoinDto {
  @IsNotEmpty()
  @IsString()
  chat_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}

export class ChatMessageDto extends ChatJoinDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
