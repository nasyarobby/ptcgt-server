import ShortUniqueId from 'short-unique-id';
import { WebSocketServer } from 'ws';
import { setupDeck } from './Classes/setupDeck.js';
import Redis from 'ioredis';
import randomInteger from 'random-int';
import Randomizer from './Classes/Randomizer.js';

const wss = new WebSocketServer({ port: 8080 });

const redis = new Redis();

class PlayerWs {
  constructor(pid, ws) {
    /** @type {string} */
    this.pid = pid;
    /** @type {WebSocket} */
    this.ws = ws;
  }
}

const users = {};

/**
 * @param {string} roomId
 * @param {string} fromId
 * @param {string} message
 */
async function sendChat(roomId, fromId, message) {
  const chatHashKey = `ptcgt:chats:${roomId}`;

  const players = await getPlayersInRoom(roomId);
  const player = players.find((p) => p.id === fromId);

  const data = {
    ackId: Date.now(),
    fromName: fromId === 'system' ? 'system' : player.name,
    fromId,
    message: message,
  };

  redis.zadd(chatHashKey, Math.floor(Date.now() / 1000), JSON.stringify(data));

  players.forEach((p) => {
    users[p.id]?.ws.send(
      JSON.stringify({
        c: 's_chat',
        d: data,
      })
    );
  });
}

/**
 * @param roomId
 * @param message
 */
async function sendSystemMessage(roomId, message) {
  return sendChat(roomId, 'system', message);
}

/**
 * @param roomId
 * @param step
 */
async function getState(roomId, step = null) {
  const roomHashKey = `ptcgt:games:${roomId}`;
  if (step) {
    const state = redis.hget(roomHashKey, `state_${step}`).then(JSON.parse);
    return {
      state,
      step,
    };
  }
  const lastStateNum = await redis.hget(roomHashKey, 'step').then(Number);
  const lastState = await redis
    .hget(roomHashKey, `state_${lastStateNum}`)
    .then(JSON.parse);
  return {
    state: lastState,
    step: lastStateNum,
  };
}

/**
 * @param roomId
 * @param playerId
 * @param message
 */
async function sendLatestStateToAllPlayers(roomId, playerId, message) {
  const lastState = await getState(roomId);
  const players = await getPlayersInRoom(roomId);
  if (message) {
    sendSystemMessage(roomId, message);
  }
  
  players.forEach((player) => {

    if (users[player.id])
      users[player.id].ws.send(
        JSON.stringify({
          c: 's_latest_state',
          d: {
            state: lastState.state, step: lastState.step 
          },
        })
      );
  });
}

/**
 * @param roomId
 */
async function getChats(roomId) {
  const chatHashKey = `ptcgt:chats:${roomId}`;
  const data = await redis.zrange(chatHashKey, 0, -1);
  return data.map(JSON.parse);
}

/**
 * @param roomId
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
 * @param roomId
 */
async function getPlayersInRoom(roomId) {
  const roomHashKey = `ptcgt:games:${roomId}`;
  const [code, p1id, p1name, p2id, p2name] = await Promise.all([
    redis.hget(roomHashKey, 'code'),
    redis.hget(roomHashKey, 'p1_id'),
    redis.hget(roomHashKey, 'p1_name'),
    redis.hget(roomHashKey, 'p2_id'),
    redis.hget(roomHashKey, 'p2_name'),
  ]);

  if (!code) {
    throw new Error('Room not found');
  }

  return [
    {
      id: p1id,
      name: p1name,
    },
    {
      id: p2id,
      name: p2name,
    },
  ];
}
/**
 * @param pid
 * @param deckName
 * @param deckstring
 * @param deckData
 */
function saveDeck(pid, deckName, deckstring, deckData) {
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
  return redis.hset(
    `decks:${pid}`,
    deckName || 'default',
    JSON.stringify({
      deck,
      cards,
      deckstring,
    })
  );
}

/**
 * @param {import("ws").RawData} msgData
 * @returns {{cmd: string, data: object, pid: string, roomId: string}}
 */
function parseMessage(msgData) {
  const { cmd, pid, roomId, ...data } = JSON.parse(msgData.toString());

  const newPid = new ShortUniqueId({ length: 32 }).rnd();

  console.log({
    cmd,
    pid,
    roomId,
    data,
  });

  return {
    cmd,
    pid: pid || newPid,
    newPid: !!newPid,
    roomId,
    data,
  };
}

/**
 * @param pid
 */
function getDecks(pid) {
  return redis.hgetall(`decks:${pid}`);
}

/**
 * @param ws
 * @param {ReturnType<parseMessage>} message
 */
async function handleMessage(ws, message) {
  const { cmd, pid, data, roomId } = message;

  if (pid) {
    users[pid] = new PlayerWs(pid, ws);
  }

  if (cmd === 'auth') {
    ws.send(
      JSON.stringify({
        c: 's_ok_auth',
        d: { pid },
      })
    );
  }

  if (cmd === 'create_game') {
    ws.send(
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

    const deckBuffer = await redis.hget(`decks:${pid}`, data.deckName);
    await redis.hset(roomHashKey, 'p1_deck', deckBuffer);
    await redis.hset(roomHashKey, 'p2_deck', null);
    await redis.hset(roomHashKey, 'p1_id', pid);
    await redis.hset(roomHashKey, 'p2_id', null);
    await redis.hset(roomHashKey, 'p1_name', 'name');
    await redis.hset(roomHashKey, 'p2_name', 'name');
    await redis.hset(roomHashKey, 'step', 0);

    ws.send(
      JSON.stringify({
        c: 's_ok_create_game',
        d: {
          code,
          roomId,
        },
      })
    );
  }

  if (cmd === 'join_game') {
    ws.send(
      JSON.stringify({
        c: 's_pending_join_game',
        d: {},
      })
    );

    const roomHashKey = await redis.hget('ptcgt:codes', data.code);
    const roomIdFromHash =
      roomHashKey.split(':')[roomHashKey.split(':').length - 1];
    const roomInfo = await getRoomInfo(roomIdFromHash);
    if (roomInfo.code === data.code) {
      const deckBuffer = await redis.hget(`decks:${pid}`, data.deckName);
      await redis.hset(roomHashKey, 'p2_deck', deckBuffer);
      await redis.hset(roomHashKey, 'p2_id', pid);
      await redis.hset(roomHashKey, 'p2_name', 'name');
    }

    ws.send(
      JSON.stringify({
        c: 's_ok_join_game',
        d: {
          code: roomInfo.code,
          roomId: roomIdFromHash,
        },
      })
    );

    if (!roomInfo.players[0].id || !users[roomInfo.players[0].id]) {
      console.log('error');
      return;
    }

    users[roomInfo.players[0].id].ws.send(
      JSON.stringify({
        c: 's_p2_joined',
        d: { name: roomInfo.players[1].name },
      })
    );

    /**
     * Setup a game
     */

    // copy deck
    const players = await getPlayersInRoom(roomIdFromHash);

    const gameData = {
      players: await Promise.all(
        players.map(async (player, index) => {
          const roomHashKey = `ptcgt:games:${roomIdFromHash}`;

          const playerNum = index + 1;

          const deck = await redis.hget(roomHashKey, `p${playerNum}_deck`);

          console.log({ deck });

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
  }

  if (cmd === 'call_coin_flip') {
    const roomHashKey = `ptcgt:games:${roomId}`;
    const existing = await redis.hget(roomHashKey, 'coin-flip');
    if (existing) {
      console.log('Cannot start flip coin');
      return ws.send(JSON.stringify({ c: 's_fail_call_coin_flip' }));
    }
    await redis.hset(roomHashKey, 'coin-flip', pid);
    await redis.hset(roomHashKey, 'coin-flip-heads', 0);
    await redis.hset(roomHashKey, 'coin-flip-tails', 0);

    sendChat(roomId, 'system', 'Flipping coins starts.');

    const data = {
      c: 's_call_coin_flip',
      d: { who: pid },
    };
    const players = await getPlayersInRoom(roomId);
    console.log({ players });
    console.log({ users });
    players.forEach((p) => {
      users[p.id]?.ws.send(JSON.stringify(data));
    });
  }

  if (cmd === 'close_coin_flip') {
    const roomHashKey = `ptcgt:games:${roomId}`;
    const existing = await redis.hget(roomHashKey, 'coin-flip');
    if (!existing) {
      console.log('Cannot close flip coin');
      return ws.send(JSON.stringify({ c: 's_fail_close_coin_flip' }));
    }

    const [heads, tails] = await Promise.all([
      redis.hget(roomHashKey, 'coin-flip-heads'),
      redis.hget(roomHashKey, 'coin-flip-tails'),
    ]);

    await redis.hset(roomHashKey, 'coin-flip', null);
    const data = {
      c: 's_close_coin_flip',
      d: {},
    };
    sendChat(
      roomId,
      'system',
      `Flipping coins ended. Result: ${Number(heads)} heads, ${Number(
        tails
      )} tails.`
    );
    const players = await getPlayersInRoom(roomId);
    players.forEach((p) => {
      users[p.id]?.ws.send(JSON.stringify(data));
    });
  }

  if (cmd === 'flip_coin') {
    const isHead = Math.random() <= 0.5 ? true : false;
    console.log(`Coin flip: ${isHead ? 'head' : 'tail'}`);
    const roomHashKey = `ptcgt:games:${roomId}`;

    const [heads, tails] = await Promise.all([
      redis.hget(roomHashKey, 'coin-flip-heads'),
      redis.hget(roomHashKey, 'coin-flip-tails'),
    ]);

    if (isHead) {
      await redis.hset(roomHashKey, 'coin-flip-heads', Number(heads) + 1);
      const players = await getPlayersInRoom(roomId);
      players.forEach((p) => {
        users[p.id]?.ws.send(
          JSON.stringify({
            c: 's_flip_coin_heads',
            d: {
              heads: Number(heads),
              tails: Number(tails),
            },
          })
        );
      });
    } else {
      await redis.hset(roomHashKey, 'coin-flip-tails', Number(tails) + 1);
      const players = await getPlayersInRoom(roomId);
      players.forEach((p) => {
        users[p.id]?.ws.send(
          JSON.stringify({
            c: 's_flip_coin_tails',
            d: {
              heads: Number(heads),
              tails: Number(tails),
            },
          })
        );
      });
    }

    await new Promise((res) => {
      setTimeout(() => {
        res();
      }, 2500);
    }).then(() => {
      sendChat(
        roomId,
        'system',
        `Flip coin result: ${isHead ? 'HEAD' : 'TAIL'}`
      );
    });
  }

  if (cmd === 'get_decks') {
    const decks = await getDecks(pid);
    ws.send(
      JSON.stringify({
        c: 's_ok_get_decks',
        d: {
          decks: Object.keys(decks).map((name) => {
            return {
              name,
              data: JSON.parse(decks[name]),
            };
          }),
        },
      })
    );
  }

  if (cmd === 'save_deck') {
    ws.send(
      JSON.stringify({
        c: 's_pending_save_deck',
        d: {},
      })
    );
    const deck = await setupDeck(data.deck, {
      onCardFound: (line, card, index, arr) => {
        ws.send(
          JSON.stringify({
            c: 's_card_found',
            d: {
              line,
              card,
              index,
              count: arr.length,
            },
          })
        );
      },
    });

    await saveDeck(pid, data.deckName, data.deck, deck);

    ws.send(
      JSON.stringify({
        c: 's_ok_save_deck',
        d: { deck: deck },
      })
    );
  }

  if (cmd === 'get_room_info') {
    const roomInfo = await getRoomInfo(roomId);
    const roomHashKey = `ptcgt:games:${roomId}`;

    if (
      roomInfo.players.filter((e) => !!e.id).length === 2 &&
      roomInfo.step.toString() === '0'
    ) {
      const lastState = await redis.hget(roomId, 'state_1');
      if (!lastState) {
        const players = await getPlayersInRoom(roomId);
        const gameData = {
          players: await Promise.all(
            players.map(async (player, index) => {
              const roomHashKey = `ptcgt:games:${roomId}`;

              sendChat(roomId, 'system', `${player.name} shuffled their deck.`);

              const playerNum = index + 1;
              const deck = await redis.hget(roomHashKey, `p${playerNum}_deck`);
              console.log({ deck });
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

        await redis.hset(roomHashKey, 'state_1', JSON.stringify(gameData));
        await redis.hset(roomHashKey, 'step', 1);
      }
    }

    ws.send(
      JSON.stringify({
        c: 's_ok_get_room_info',
        d: { roomInfo },
      })
    );

    sendLatestStateToAllPlayers(roomId);
  }

  if (cmd === 'chat') {
    sendChat(roomId, pid, data.message);
  }

  if (cmd === 'get_chats') {
    const data = await getChats(roomId);
    ws.send(
      JSON.stringify({
        c: 's_get_chats',
        d: { chats: data },
      })
    );
  }

  if (cmd === 'draw_from_deck_top') {
    const latestState = await getState(roomId);
    const playerNum = latestState.state.players.findIndex((p) => p.id === pid);
    const deck = latestState.state.players[playerNum].deck;
    const cards = deck.slice(0, 1);
    const hand = latestState.state.players[playerNum].hand;
    const newHand = [...hand, ...cards];
    const newDeck = deck.slice(1);
    const newPlayerState = {
      ...latestState.state.players[playerNum],
      hand: newHand,
      deck: newDeck,
    };
    latestState.state.players[playerNum] = newPlayerState;
    const roomHashKey = `ptcgt:games:${roomId}`;
    await redis.hset(
      roomHashKey,
      'step',
      latestState.step+1
    )

    await redis.hset(
      roomHashKey,
      `state_${latestState.step+1}`,
      JSON.stringify(latestState.state)
    );

    sendLatestStateToAllPlayers(roomId, pid, 'Player drew 1 card.')
  }
}

wss.on('connection', function (ws) {
  ws.on('message', function incomingMessageHandle(msgData) {
    const message = parseMessage(msgData);
    handleMessage(ws, message);
  });
});
