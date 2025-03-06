import { Player } from '../Classes/Player.js';
import PlayerMessage from '../Classes/PlayerMessage.js';
import Randomizer from '../Classes/Randomizer.js';
import redis from '../Classes/Redis.js';
import playersReg from './../Classes/Players.js';


/**
 * @param {string} roomId
 */
async function getRoomInfo(roomId) {
  const roomHashKey = `ptcgt:games:${roomId}`;
  const [code, step, p1id, p1name, p1deck, p2id, p2name, p2deck, coinFlip] =
      await Promise.all([
        redis.hget(roomHashKey, 'code'),
        redis.hget(roomHashKey, 'step'),
        redis.hget(roomHashKey, 'p1_id'),
        redis.hget(roomHashKey, 'p1_name'),
        redis.hget(roomHashKey, 'p1_deck'),
        redis.hget(roomHashKey, 'p2_id'),
        redis.hget(roomHashKey, 'p2_name'),
        redis.hget(roomHashKey, 'p2_deck'),
        redis.hget(roomHashKey, 'coin-flip'),
      ]);
  return {
    code,
    step,
    coinFlip,
    players: [
      {
        id: p1id,
        name: p1name,
        deck: p1deck ? JSON.parse(p1deck) : {},
      },
      {
        id: p2id,
        name: p2name,
        deck: p2deck ? JSON.parse(p2deck) : {},
      },
    ],
  };
}

/**
 * @param {PlayerMessage} message
 */
export default async function handleJoinGame(message) {
  if (message.cmd === 'join_game') {
    console.log(message)
    message.player.ws.sendCmd('s_pending_join_game', {} );
    
    const roomHashKey = await redis.hget('ptcgt:codes', message.data.code);
    const roomIdFromHash =
          roomHashKey.split(':')[roomHashKey.split(':').length - 1];
    const roomInfo = await getRoomInfo(roomIdFromHash);
    console.log(roomInfo)
    console.log(message.data)
    if (roomInfo.code !== message.data.code) {
      throw new Error('Code not match')
    }
    const deckBuffer = await redis.hget(`ptcgt:decks:${message.player.id}`, message.data.deckName);
    await redis.hset(roomHashKey, 'p2_deck', deckBuffer);
    await redis.hset(roomHashKey, 'p2_id', message.player.id);
    await redis.hset(roomHashKey, 'p2_name', 'name');
    
    message.player.ws.sendCmd(
      's_ok_join_game',
      {
        code: roomInfo.code,
        roomId: roomIdFromHash,
      },
    );
  
    console.log({
      roomInfo, roomInfoPlayers: roomInfo.players, reg: playersReg.players
    })
    
    const playerOne  = playersReg.players[roomInfo.players[0].id]
    if (!roomInfo.players[0].id || !playerOne.id) {
      console.log('error');
      return;
    }
    
    playerOne.ws.sendCmd(
      's_p2_joined',
      { name: roomInfo.players[1].name },
    );
    
    /**
     * Setup a game
     */
    
    
    /**
     * @type {Player[]}
     */
    const players = [playerOne, message.player];
    
    const gameData = {
      players: await Promise.all(
        players.map(async (player, index) => {
          const roomHashKey = `ptcgt:games:${roomIdFromHash}`;
    
          const playerNum = index + 1;
    
          const deck = await redis.hget(roomHashKey, `p${playerNum}_deck`);
          return {
            id: player.id,
            name: player.name,
            deck: new Randomizer(roomInfo.code).shuffle(
              JSON.parse(deck).deck,
              roomInfo.step
            ),
            trash: [],
            hand: [],
            lostZone: [],
            side: [],
            playground: [],
            arena: [],
          };
        })
      ),
    };
    
    await redis.hset(
      roomHashKey,
      `state_${roomInfo.step}`,
      JSON.stringify(gameData)
    );

    const latestRoomInfo = await getRoomInfo(roomIdFromHash);


    players.forEach(player => {
      player.ws.sendCmd('s_game_setup', {players: latestRoomInfo.players})
    })
  }
    
}