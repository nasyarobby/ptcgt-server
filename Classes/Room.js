import { Redis } from 'ioredis'
import { Player } from './Player.js'

export default class Room {
  /**
   * @param {Redis} redis
   * @param {string | undefined} roomId 
   * @param {Player | undefined} player 
   */
  constructor(redis, roomId, player) {
    this.id = roomId || new ShortUniqueId({ length: 32 }).rnd()
    this.players = [player || null, null]
    this.playerOne = player
    /**
     * @type {Redis}
     */
    this.redis = redis
  }

  /**
   * @param {string} message 
   * @param {string} from
   * @param {"chat" | "action"} type 
   */
  broadcastChat(message, from, type='chat') {
    const timestamp = Date.now()
    const data = {
      timestamp, type, from, message, 
    }
    this.redis.zadd(`ptcgt:rooms:${this.id}:chats`, 
      Math.floor(Date.now() / 1000), JSON.stringify(data)
    )
  }
}