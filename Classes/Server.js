import { WebSocketServer } from 'ws';
import { Player } from './Player.js';
import handleChats from '../handles/chats.handle.js';
import PlayerMessage from './PlayerMessage.js';
import players from './Players.js';

export default class Server {
  constructor() {
    /** @type {{[string]: import('../@types').Room}} */
    this.rooms = {}

    /** @type {WebSocketServer} */
    this.wss = new WebSocketServer({ port: 8080 });
    this.setup();
  }

  setup() {
    this.wss.on('connection', ws => {
      console.log('Connected')
      ws.sendCmd = (cmd, data) => {
        return ws.send(JSON.stringify({
          cmd, ...data
        }))
      }
      ws.on('message', (message) => {
        this.handleIncomingMessage(this, ws,  message)
      })
    })
  }

  /**
   * @param {Server} server
   * @param {import('ws').WebSocket} ws
   * @param {import('ws').RawData} rawData
   */
  async handleIncomingMessage(server, ws, rawData) {
    try {
      /**
       * @type {import('../@types').Message}
       */
      const parsed = JSON.parse(rawData);
      /** @type {Player} */
      const player = players.registerPlayer(parsed.pid, ws)
      const playerRoom = await player.getRoom()
      const messageFromPlayer = new PlayerMessage(
        player,
        playerRoom,
        parsed
      )

      handleChats(messageFromPlayer)

    }
    catch(err) {
      console.log(err.message)
      return this.handleIncomingMessage(server, ws, '{}')
      // error in parsing
    }
  }

}
