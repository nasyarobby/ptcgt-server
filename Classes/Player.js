import { Redis } from 'ioredis';
import { WebSocket } from 'ws';
import rooms from './Rooms.js';
import Room from './Room.js';

export class Player {
  /**
   * @param {Redis} redis
   * @param {string} pid 
   * @param {WebSocket} ws 
   */
  constructor(redis, pid, ws) {
    /**
     * @type {Redis}
     */
    this.redis = redis
    /** @type {string} */
    this.id = pid;
    /** @type {WebSocket & {sendCmd: (cmd:string, data:object) => void}} */
    this.ws = ws;
  }

  /**
   * @returns {Promise<Room | null>}
   */
  async getRoom() {
    const roomId = await this.redis.hget(`ptcgt:players+${this.id}`, 'room')
    if(roomId)
      return rooms.getOrCreateRoom(roomId)
    else return null;
  }

  sendChat(from, message) {
    this.ws.send()
  }
}
