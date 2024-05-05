import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ChatModule, StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
