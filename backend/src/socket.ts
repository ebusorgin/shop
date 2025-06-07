import wsPkg from 'ws';
import { AuthController } from './auth.controller';

const { WebSocketServer } = wsPkg;

export class SocketServer {
  private wss: any;

  constructor(private controller: AuthController, port = 8080) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws: any) => this.handle(ws));
  }

  private handle(ws: any) {
    ws.on('message', (data: any) => this.controller.handleMessage(ws, data.toString()));
  }
}
