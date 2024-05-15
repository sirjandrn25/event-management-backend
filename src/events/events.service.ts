import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private db: PrismaService) {}
  create(createEventDto: CreateEventDto, user_id: string) {
    return this.db.event.create({
      data: {
        ...createEventDto,
        user_id,
      },
    });
  }

  findAll(user_id: string) {
    return this.db.event.findMany({
      where: {
        user_id,
      },
    });
  }

  findOne(id: string) {
    return this.db.event.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.db.event.update({
      where: {
        id,
      },
      data: updateEventDto,
    });
  }

  remove(id: string) {
    return this.db.event.delete({
      where: {
        id,
      },
    });
  }
}
