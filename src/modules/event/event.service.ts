import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { EventTypes } from '@shared/enums';
import { usersSocketStore } from '@shared/services';
import { HttpUserPayload } from '@shared/types';

@Injectable()
export class EventService {
  constructor(private readonly jwtService: JwtService) {}

  sendEvent(event: EventTypes, userIds: string[], payload: unknown): void {
    const clients = [...new Set(userIds.flatMap((userId) => usersSocketStore.getClient(userId)))];
    // API don't need to wait until events will be sent, so no await here
    Promise.all(clients.map(async (client) => {
      if (!client) {
        return;
      }
      client.emit(event, payload);
    }));
  }

  async handleConnection(socket: Socket): Promise<string | void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const token of (socket?.handshake?.headers?.authorization ?? '').split(';').filter(Boolean)) {
      try {
        const payload = this.jwtService.verify<HttpUserPayload>(token);
        usersSocketStore.addClient(payload.userId, socket);
      } catch {
        const payload = this.jwtService.decode<Record<string, unknown>>(token);
        if (payload && typeof payload.userId === 'string') {
          socket.emit('error', {
            message: 'Failed to connect. Unauthorized',
            userId: payload.userId,
          });
        } else {
          socket.emit('error', {
            message: 'Failed to connect. Unauthorized',
            userId: '',
          });
          socket.disconnect();
          break;
        }
      }
    }

    socket.on('disconnect', () => {
      usersSocketStore.deleteClient(socket);
    });
  }
}
