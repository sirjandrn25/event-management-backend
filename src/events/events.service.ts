import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMinutes } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from 'src/websockets/notification.gateway';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    private db: PrismaService,
    private notificationGateway: NotificationGateway,
    private readonly mailService: MailerService,
  ) {}
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

  async update(id: string, updateEventDto: UpdateEventDto) {
    return this.db.event.update({
      where: {
        id,
      },
      data: {
        participates: updateEventDto?.participates,
        title: updateEventDto?.title,
        description: updateEventDto?.description,
        start_time: updateEventDto?.start_time,
        end_time: updateEventDto?.end_time,
      },
    });
  }

  async checkEventAlreadyExist(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.db.event.findUnique({
      where: {
        id,
      },
    });
    const startTime = new Date(updateEventDto?.start_time);
    const endTime = new Date(updateEventDto?.end_time);
    const existEvents = await this.db.event.findMany({
      where: {
        user_id: event.user_id,

        start_time: {
          gte: startTime,
          lte: addMinutes(startTime, 1),
        },
        end_time: {
          gte: new Date(endTime),
          lte: addMinutes(endTime, 1),
        },
      },
    });
    return existEvents?.length > 1;
  }

  remove(id: string) {
    return this.db.event.delete({
      where: {
        id,
      },
    });
  }

  sendMail({
    email,
    subject,
    message,
  }: {
    email: string;
    subject: string;
    message: string;
  }) {
    this.mailService.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      text: message,
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    const currentTime = new Date();

    const events = await this.db.event.findMany({
      where: {
        start_time: {
          gte: currentTime,
          lte: addMinutes(currentTime, 1),
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    events.forEach((event) => {
      // Send notification for each event
      this.notificationGateway.sendScheduleNotification(event);
      const subject = 'Calendar Event';
      const message = `${event.title} is start`;

      this.sendMail({
        email: event?.user?.email,
        subject,
        message,
      });
      event?.participates?.forEach((email) => {
        this.sendMail({
          email,
          subject,
          message,
        });
      });
    });
  }

  sendNotification(event): void {
    // Your code to send notification, e.g., sending a push notification, email, etc.
    console.log(`Sending notification for event: ${event.title}`);
  }
}
