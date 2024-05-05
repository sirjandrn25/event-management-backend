import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatWithUserDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('chat')
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
    const chat = await this.chatService.create({
      title: createChatDto?.title,
      is_group: createChatDto?.is_group,
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
