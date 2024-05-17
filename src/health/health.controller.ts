import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check(): Promise<string> {
    try {
      await this.prismaService.$connect();
      return 'Prisma is connected and healthy';
    } catch (error) {
      return `Prisma connection error: ${error.message}`;
    }
  }
}
