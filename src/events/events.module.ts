import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WebSocketsModule } from 'src/websockets/websocket.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [PrismaModule, WebSocketsModule],
})
export class EventsModule {}
