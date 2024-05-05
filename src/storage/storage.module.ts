import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [StorageController],
  imports: [PrismaModule],
})
export class StorageModule {}
