import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({ namespace: 'websockets' })
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('event')
  handleEvent(@MessageBody() data: any): void {
    this.server.emit('event', data);
  }
}
