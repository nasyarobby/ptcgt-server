import randomInteger from 'random-int'
import ShortUniqueId from 'short-unique-id';
import redis from '../Classes/Redis.js';

/**
 * @param {import("./../Classes/PlayerMessage").default} message
 */
export default async function handleCreateGame(message) {
  const data = message.data
  if (message.cmd === 'create_game') {
    message.player.ws.send(
      JSON.stringify({
        c: 's_pending_create_game',
        d: {},
      })
    );
 
    const code = randomInteger(111111, 99999);
    const roomId = new ShortUniqueId({ length: 6 }).rnd();
    const roomHashKey = `ptcgt:games:${roomId}`;
 
    await redis.hset('ptcgt:codes', code, roomHashKey);
    await redis.hset(roomHashKey, 'code', code);
 
    const deckBuffer = await redis.hget(`ptcgt:decks:${message.player.id}`, data.deckName);
    await redis.hset(roomHashKey, 'p1_deck', deckBuffer);
    await redis.hset(roomHashKey, 'p2_deck', null);
    await redis.hset(roomHashKey, 'p1_id', message.player.id);
    await redis.hset(roomHashKey, 'p2_id', null);
    await redis.hset(roomHashKey, 'p1_name', 'name');
    await redis.hset(roomHashKey, 'p2_name', 'name');
    await redis.hset(roomHashKey, 'step', 0);
 
    message.player.ws.send(
      JSON.stringify({
        c: 's_ok_create_game',
        d: {
          code,
          roomId,
        },
      })
    );
  }
}