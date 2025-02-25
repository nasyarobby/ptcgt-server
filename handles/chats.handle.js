import PlayerMessage from '../Classes/PlayerMessage.js';

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
 * @param {import("../@types").Player} Player
 * @param {PlayerMessage} message
 */
export default async function handleChats(message) {
  if (message.cmd === 'chat') {
    sendChat(message.room.id, message.player.id, message.data);
  }

  if (message.cmd === 'get_chats') {
    const data = await getChats(roomId);
    ws.send(
      JSON.stringify({
        c: 's_get_chats',
        d: { chats: data },
      })
    );
  }
}