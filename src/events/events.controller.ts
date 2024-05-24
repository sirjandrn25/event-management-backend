import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @Request() request) {
    const userId = request.user.id;
    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  findAll(@Request() request) {
    const userId = request.user.id;
    return this.eventsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    try {
      const isAlreadyExists = await this.eventsService.checkEventAlreadyExist(
        id,
        updateEventDto,
      );
      if (isAlreadyExists)
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Duplicate event',
          },
          HttpStatus.FORBIDDEN,
          {
            cause: 'Duplicate event',
          },
        );
      return this.eventsService.update(id, updateEventDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'This is a custom message',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
