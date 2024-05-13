import { Socket } from 'socket.io';

class UsersSocketStore {
  private readonly connectedClients: Map<string, Socket> = new Map();

  getClient(clientId: string): Socket | undefined {
    return this.connectedClients.get(clientId);
  }

  addClient(clientId: string, client: Socket) {
    this.connectedClients.set(clientId, client);
  }

  deleteClient(clientId: string) {
    this.connectedClients.delete(clientId);
  }
}

export const usersSocketStore = new UsersSocketStore();
