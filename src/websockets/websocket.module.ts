import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway],
  imports: [PrismaModule],
})
export class WebSocketsModule {}
