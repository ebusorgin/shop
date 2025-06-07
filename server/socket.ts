import { WebSocketServer, WebSocket } from 'ws';
import { AuthController } from './auth.controller';

export class SocketServer {
  private wss: WebSocketServer;

  constructor(private controller: AuthController, port = 8080) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws) => this.handle(ws));
  }

  private handle(ws: WebSocket) {
    ws.on('message', (data) => this.controller.handleMessage(ws, data.toString()));
  }
}
