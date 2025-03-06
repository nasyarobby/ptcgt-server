import redis from '../Classes/Redis.js';

/**
 * @param {string} roomId
 * @returns {Promise<{
 * code:string,
 * step: string,
 * coinFlip: string,
 * players: {id: string, name: string, deck: any}[]
 * }>}
 */
export default async function getRoomInfo(roomId) {
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
  