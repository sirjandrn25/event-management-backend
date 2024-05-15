// notification.gateway.ts

import { UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketsExceptionFilter } from './ws-exception.filter';

@WebSocketGateway({ cors: { origin: '*' } })
@UseFilters(new WebSocketsExceptionFilter())
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendNotification(event): void {
    // Emit notification event to connected clients
    this.server.emit('notification', event);
  }
  sendScheduleNotification(event: any) {
    this.server.emit(`scheduler-event`, event);
  }
}
