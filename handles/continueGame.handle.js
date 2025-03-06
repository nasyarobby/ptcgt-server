import { Player } from '../Classes/Player.js';
import PlayerMessage from '../Classes/PlayerMessage.js';
import Randomizer from '../Classes/Randomizer.js';
import redis from '../Classes/Redis.js';
import playersReg from './../Classes/Players.js';
import getRoomInfo from './getRoomInfo.js';

/**
 * @param {PlayerMessage} message
 */
export default async function handleContinueGame(message) {
  if (message.cmd === 'continue_game') {
    console.log(message.data)
    const roomId = message.data.roomId;
    const roomInfo = await getRoomInfo(roomId);
    message.player.ws.sendCmd('s_continue_game', {players: roomInfo.players})
  }
    
}