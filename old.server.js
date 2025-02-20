import WebSocket, { WebSocketServer } from 'ws';
import Ioredis from 'ioredis';
import ShortUniqueId from 'short-unique-id';
import randomInt from 'random-int';
import { setupDeck } from './Classes/setupDeck.js';
const redis = new Ioredis();

const wss = new WebSocketServer({ port: 8080 });

const users = {};

wss.on('connection', function (ws, req) {
  console.log('Client connected');
  console.log(Object.keys(users));

  /**
   * @param roomIdPlayerId
   */
  async function getPlayers(roomIdPlayerId) {
    const [roomId, playerId] = roomIdPlayerId.split(':');
    const roomHashKey = `ptcgt:room:${roomId}`;

    const [p1id, p2id] = await Promise.all([
      redis.hget(roomHashKey, 'p1-id'),
      redis.hget(roomHashKey, 'p2-id'),
    ]);

    let playerNum = 0;
    users[playerId] = ws;
    if (p1id && p1id === playerId) {
      playerNum = 1;
    } else if (p2id && p2id === playerId) {
      playerNum = 2;
    }
    return {
      p1id,
      p2id,
      playerId: playerNum === 1 ? p1id : p2id,
      oppId: playerNum === 1 ? p2id : p1id,
      playerNum,
    };
  }

  /**
   * @param roomIdPlayerId
   */
  async function getGameState(roomIdPlayerId) {
    const [roomId, playerId] = roomIdPlayerId.split(':');
    const roomHashKey = `ptcgt:room:${roomId}`;

    const [
      p1id,
      p1name,
      p1cardsBuffer,
      p1deck,
      p1deckstring,
      p2id,
      p2name,
      p2cardsBuffer,
      p2deck,
      p2deckstring,
      code,
    ] = await Promise.all([
      redis.hget(roomHashKey, 'p1-id'),
      redis.hget(roomHashKey, 'p1-name'),
      redis.hget(roomHashKey, 'p1-cards'),
      redis.hget(roomHashKey, 'p1-deck'),
      redis.hget(roomHashKey, 'p1-deckstring'),
      redis.hget(roomHashKey, 'p2-id'),
      redis.hget(roomHashKey, 'p2-name'),
      redis.hget(roomHashKey, 'p2-cards'),
      redis.hget(roomHashKey, 'p2-deck'),
      redis.hget(roomHashKey, 'p2-deckstring'),
      redis.hget(roomHashKey, 'code'),
    ]);

    let playerNum = 0;
    users[playerId] = ws;
    if (p1id && p1id === playerId) {
      playerNum = 1;
    } else if (p2id && p2id === playerId) {
      playerNum = 2;
    }

    return {
      playerNum,
      roomId,
      playerId,
      code,
      p1: {
        id: p1id,
        name: p1name,
        cards: JSON.parse(p1cardsBuffer),
        deckstring: p1deckstring,
        deck: JSON.parse(p1deck),
      },
      p2: {
        id: p2id,
        name: p2name,
        cards: JSON.parse(p2cardsBuffer),
        deckstring: p2deckstring,
        deck: JSON.parse(p2deck),
      },
    };
  }

  /**
   * @param {WebSocket} ws
   * @param {Awaited<ReturnType<getGameState>>} gameState
   */
  function sendGameState(ws, gameState) {
    const oppPlayerNum = gameState.playerNum === 1 ? 2 : 1;
    const oppState = gameState[`p${oppPlayerNum}`];
    if (oppState) {
      const oppWs = users[oppState.id];
      if (oppWs)
        oppWs.send(
          JSON.stringify({
            c: 'STATE',
            d: {
              pn: oppPlayerNum,
              c: gameState.code,
              own: {
                n: oppState ? oppState.name : null,
                ds: oppState ? oppState.deckstring : null,
                c: oppState ? oppState.cards : null,
                d: oppState ? oppState.deck : null,
              },
              opp: {
                n: gameState[`p${gameState.playerNum}`].name,
                ds: gameState[`p${gameState.playerNum}`].deckstring,
                c: gameState[`p${gameState.playerNum}`].cards,
                d: gameState[`p${gameState.playerNum}`].deck,
              },
            },
          })
        );
    }

    ws.send(
      JSON.stringify({
        c: 'STATE',
        d: {
          pn: gameState.playerNum,
          c: gameState.code,
          own: {
            n: gameState[`p${gameState.playerNum}`].name,
            ds: gameState[`p${gameState.playerNum}`].deckstring,
            c: gameState[`p${gameState.playerNum}`].cards,
            d: gameState[`p${gameState.playerNum}`].deck,
          },
          opp: {
            n: oppState ? oppState.name : null,
            ds: oppState ? oppState.deckstring : null,
            c: oppState ? oppState.cards : null,
            d: oppState ? oppState.deck : null,
          },
        },
      })
    );
  }

  ws.on('message', async function (msg) {
    const [cmd, ...dataBuffer] = msg.toString().split(';;');
    const dataString = dataBuffer.join(';;');

    if (cmd === 'create-game') {
      const roomCode = randomInt(111111, 999999);
      const roomId = new ShortUniqueId({ length: 8 }).rnd();
      const playerId = new ShortUniqueId({ length: 8 }).rnd();

      /** @type {{name: string}} */
      const data = JSON.parse(dataString);

      console.log({
        roomCode,
        roomId,
      });

      await redis.hset('ptcgt:codes', roomCode, `ptcgt:room:${roomId}`);
      const roomHashKey = `ptcgt:room:${roomId}`;
      await redis.hset(roomHashKey, 'code', roomCode);
      await redis.hset(roomHashKey, 'p1-name', data.name);
      await redis.hset(roomHashKey, 'p1-id', playerId);
      ws.send(
        JSON.stringify({
          c: 'ROOM_CREATED',
          d: { roomId: `${roomId}:${playerId}` },
        })
      );
      const state = await getGameState(`${roomId}:${playerId}`);

      ws.send(
        JSON.stringify({
          c: 'STATE',
          d: {
            pn: state.playerNum,
            c: state.code,
            own: {
              n: state[`p${state.playerNum}`].name,
              ds: state[`p${state.playerNum}`].deckstring,
              c: state[`p${state.playerNum}`].cards,
              d: state[`p${state.playerNum}`].deck,
            },
          },
        })
      );
    }

    if (cmd === 'start_game') {
      /** @type {{roomId: string}} */
      const data = JSON.parse(dataString);
      const [roomId, playerId] = data.roomId.split(':');
      const roomHashKey = `ptcgt:room:${roomId}`;

      const { playerNum, oppId } = await getPlayers(data.roomId);

      await redis.hset(roomHashKey, `p${playerNum}-ready`, true);

      const [p1ready, p2ready] = await Promise.all([
        redis.hget(roomHashKey, 'p1-ready'),
        redis.hget(roomHashKey, 'p2-ready'),
      ]);

      ws.send(
        JSON.stringify({
          c: 'PLAYER_READINESS',
          d: {
            player: playerNum === 1 ? p1ready : p2ready,
            opp: playerNum === 2 ? p1ready : p2ready,
          },
        })
      );

      if(users[oppId])
        users[oppId].send(JSON.stringify({
          c: 'PLAYER_READINESS',
          d: {
            player: playerNum === 2 ? p1ready : p2ready,
            opp: playerNum === 1 ? p1ready : p2ready,
          },
        }));
    }

    if (cmd === 'reconnect') {
      /** @type {{roomId: string}} */
      const data = JSON.parse(dataString);
      const state = await getGameState(data.roomId);

      console.log(state);

      if (state.playerNum === 0) return;

      sendGameState(ws, state);
      return;
    }

    if (cmd === 'update-deck') {
      /** @type {{deck: string}} */
      const data = JSON.parse(dataString);

      const [roomId, playerId] = data.roomId.split(':');
      const roomHashKey = `ptcgt:room:${roomId}`;
      ws.send(JSON.stringify({ c: 'UPDATING_DECK' }));
      const deckData = await setupDeck(data.deck);
      const cards = {};

      deckData.forEach((card) => {
        delete card.artist;
        delete card.cardmarket;
        delete card.nationalPokedexNumbers, delete card.rarity;
        delete card.set;
        delete card.tcgplayer;
        delete card.flavorText;
        cards[card.id] = card;
      });

      const deck = deckData.map((card, index) => {
        return {
          no: `c-${index}`,
          id: card.id,
          v: 'N',
        };
      });

      const statex = await getGameState(data.roomId);

      await redis.hset(
        roomHashKey,
        `p${statex.playerNum}-deckstring`,
        data.deck,
        `p${statex.playerNum}-deck`,
        JSON.stringify(deck),
        `p${statex.playerNum}-cards`,
        JSON.stringify(cards)
      );

      const state = await getGameState(data.roomId);

      sendGameState(ws, state);
    }

    if (cmd === 'join') {
      const playerId = new ShortUniqueId({ length: 8 }).rnd();
      users[playerId] = ws;
      const { name, code } = JSON.parse(dataString);

      const hashKey = await redis.hget('ptcgt:codes', code);
      if (!hashKey) {
        return ws.send(
          JSON.stringify({
            c: 'ERROR',
            d: { m: 'Invalid room code' },
          })
        );
      }

      await redis.hset(hashKey, 'p2-name', name);
      await redis.hset(hashKey, 'p2-id', playerId);
      const roomId = hashKey.split(':')[hashKey.split(':').length - 1];

      ws.send(
        JSON.stringify({
          c: 'ROOM_JOINED',
          d: { roomId: `${roomId}:${playerId}` },
        })
      );

      const state = await getGameState(`${roomId}:${playerId}`);
      sendGameState(ws, state);

      return;
    }
  });
});
