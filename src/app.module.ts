import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { WebSocketsModule } from './websockets/websocket.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    StorageModule,
    EventsModule,
    WebSocketsModule,
    ScheduleModule.forRoot(), // Register ScheduleModule with the application
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
