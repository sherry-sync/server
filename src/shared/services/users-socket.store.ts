import { Socket } from 'socket.io';

class UsersSocketStore {
  private readonly connectedClients: Map<string, Socket[]> = new Map();

  getClient(clientId: string): Socket[] {
    return this.connectedClients.get(clientId) ?? [];
  }

  addClient(clientId: string, client: Socket) {
    if (!this.connectedClients.has(clientId)) {
      this.connectedClients.set(clientId, []);
    }
    this.connectedClients.get(clientId)?.push(client);
  }

  deleteClient(clientId: Socket) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of this.connectedClients.entries()) {
      const newValue = value.filter((client) => client !== clientId);
      if (newValue.length) {
        this.connectedClients.set(key, newValue);
      } else {
        this.connectedClients.delete(key);
      }
    }
  }
}

export const usersSocketStore = new UsersSocketStore();
