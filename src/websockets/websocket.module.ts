import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationGateway } from './notification.gateway';

@Module({
  providers: [NotificationGateway],
  imports: [PrismaModule],
  exports: [NotificationGateway],
})
export class WebSocketsModule {}
