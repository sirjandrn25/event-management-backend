import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}
  create(createChatDto: CreateChatDto) {
    return this.prisma.chat.create({
      data: {
        ...createChatDto,
      },
    });
  }

  findAll(user_id: string) {
    return this.prisma.chat.findMany({
      where: {
        chat_users: {
          some: {
            user: {
              id: user_id,
            },
          },
        },
      },
      include: {
        chat_users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.chat.findUnique({
      where: {
        id,
      },
      include: {
        chat_users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  update(id: string, updateChatDto: UpdateChatDto) {
    return this.prisma.chat.update({
      where: {
        id,
      },
      data: {
        ...updateChatDto,
      },
    });
  }

  addUserToChat(id: string, user_ids: string[]) {
    const data = user_ids?.map((user_id) => ({
      chat_id: id,
      user_id: user_id,
    }));

    return this.prisma.chatUsers.createMany({
      data: data,
      skipDuplicates: true,
    });
  }

  remove(id: string) {
    return this.prisma.chat.delete({
      where: {
        id,
      },
    });
  }

  messages(id: string) {
    return this.prisma.message.findMany({
      where: {
        chat_id: id,
      },
      include: {
        user: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
  async existedChat(ownerId: string, userId: string) {
    const chatUsers = await this.prisma.chatUsers.findMany({
      where: {
        user_id: ownerId,
      },
      include: {
        chat: {
          include: {
            chat_users: true,
          },
        },
      },
    });
    const chats = chatUsers.map((chatUser) => chatUser.chat);
    return chats.find((el) =>
      el?.chat_users.every((el: any) =>
        [ownerId, userId].includes(el?.user_id),
      ),
    );
  }
}
