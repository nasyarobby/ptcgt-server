import ShortUniqueId from 'short-unique-id';
import redis from './Redis.js';

class PlayerPool {
  constructor(redis) {
    this.redis = redis;
    this.players = {}      
  }

  /**
   * @param {string} playerId 
   * @param {import("ws").WebSocket} ws 
   * @returns {import("./Player.js").Player}
   */
  registerPlayer(playerId, ws) {
    const _playerId = playerId || new ShortUniqueId({ length: 32 }).rnd();
    this.players[_playerId] = new Player(this.redis, _playerId, ws)
    ws.sendCmd('s_auth_ok', {pid: _playerId})
    return this.players[_playerId]
  }
}

const players = new PlayerPool(redis)

export default players