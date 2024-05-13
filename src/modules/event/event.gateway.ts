import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { EventService } from '@modules/event/event.service';

@WebSocketGateway({
  transports: 'websocket',
})
export class EventGateway implements OnGatewayConnection {
  @WebSocketServer()
  // Eslint marks "server" as unused
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  private server: Socket;

  constructor(private readonly eventService: EventService) {}

  @SubscribeMessage('events')
  findAll(@MessageBody() data: unknown): unknown {
    return { test: 12, data };
  }

  async handleConnection(socket: Socket): Promise<boolean> {
    await this.eventService.handleConnection(socket);
    return true;
  }
}
