import { IncomingMessage } from "http";
import { Redis } from "ioredis";

export interface ServerInterface {
  server: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;
  players: Player[];
  rooms: Room[];
  redis: Redis;
}

export interface Room {
  roomId: string;
  players: [Player, Player];
}

export interface Message {
  pid?: string;
  data: object;
  cmd: string;
}

export interface MessageFromPlayer {
  pid: string;
  data: object;
  cmd: string;
}
