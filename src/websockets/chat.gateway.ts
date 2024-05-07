import {
  Logger,
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { WebSocketsExceptionFilter } from './ws-exception.filter';
@WebSocketGateway({ cors: { origin: '*' } })
@UseFilters(new WebSocketsExceptionFilter())
export class ChatGateway implements OnModuleInit {
  private logger = new Logger('ChatGateway');
  @WebSocketServer() server: Server;
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('socket id', socket.id);
      console.log('connected');
    });
  }

  @SubscribeMessage('message')
  @UsePipes(new ValidationPipe())
  async onMessage(@MessageBody() body: ChatMessageDto): Promise<void> {
    this.server.emit(body.chat_id, {
      data: {
        ...body,
      },
    });
    try {
      await this.prisma.message.create({
        data: {
          ...body,
        },
      });
    } catch (error) {
      console.log(`error `, error);
    }
  }

  // @SubscribeMessage('chat') // subscribe to chat event messages
  // handleMessage(@MessageBody() payload: AddMessageDto): AddMessageDto {
  //   this.logger.log(`Message received: ${payload.author} - ${payload.body}`);
  //   this.server.emit('chat', payload); // broadbast a message to all clients
  //   return payload; // return the same payload data
  // }

  // // it will be handled when a client connects to the server
  // handleConnection(socket: Socket) {
  //   this.logger.log(`Socket connected: ${socket.id}`);
  // }

  // // it will be handled when a client disconnects from the server
  // handleDisconnect(socket: Socket) {
  //   this.logger.log(`Socket disconnected: ${socket.id}`);
  // }
}
