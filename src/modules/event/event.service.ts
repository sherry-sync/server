import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { EventTypes } from '@shared/enums';
import { usersSocketStore } from '@shared/services';
import { HttpUserPayload } from '@shared/types';

@Injectable()
export class EventService {
  constructor(private readonly jwtService: JwtService) {}

  async sendEvent(event: EventTypes, userIds: string[], payload: unknown): Promise<void> {
    const clients = userIds.map((userId) => usersSocketStore.getClient(userId));
    await Promise.all(clients.map(async (client) => {
      if (!client) {
        return;
      }
      client.emit(event, payload);
    }));
  }

  async handleConnection(socket: Socket): Promise<string | void> {
    const clientId = socket.id;
    try {
      const payload = this.jwtService.verify<HttpUserPayload>(socket?.handshake?.headers?.authorization || '');

      usersSocketStore.addClient(payload.userId, socket);
    } catch {
      socket.emit('error', 'Failed to connect. Unauthorized');
      socket.disconnect();
    }

    socket.on('disconnect', () => {
      usersSocketStore.deleteClient(clientId);
    });
  }
}
