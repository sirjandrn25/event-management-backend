import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatWithUserDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chats')
@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(
    @Body() createChatDto: CreateChatWithUserDto,
    @Request() request,
  ) {
    const authorId = request.user.id;
    if (!createChatDto?.is_group) {
      const existedChat = await this.chatService.existedChat(
        request.user.id,
        createChatDto.user_ids[0],
      );

      if (existedChat) return existedChat;
    }

    const chat = await this.chatService.create({
      title: createChatDto?.title,
      is_group: createChatDto?.is_group ?? false,
    });
    const users = await this.chatService.addUserToChat(chat.id, [
      authorId,
      ...(createChatDto?.user_ids ?? []),
    ]);
    return {
      ...chat,
      chat_users: users,
    };
  }

  @Get()
  async findAll(@Request() request) {
    return this.chatService.findAll(request.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string) {
    return this.chatService.messages(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
