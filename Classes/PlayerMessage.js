import { Player } from './Player.js';
import Room from './Room.js';

export default class PlayerMessage {
  /**
   * @param {Player} player
   * @param {Room | null} room
   * @param {import('../@types').Message} message
   */
  constructor(player, room, message) {
    /**
     * @type {Player}
     */
    this.player = player

    /**
     * @type {string}
     */
    this.cmd = message.cmd

    /**
     * @type {object | undefined | null}
     */
    this.data = message.data

    /**
     * @type {Room|null}
     */
    this.room = room
  }
}