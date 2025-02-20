import Redis from 'ioredis';
import WA from 'whatsapp-web.js';

class Game {

  constructor(redis) {
    this.redis = redis
  }

  /**
   * @param {Redis} redis 
   * @returns 
   */
  async create() {
    if(!this.id) {
      const lastGame = await this.redis.zrange('game', -1, -1);
      const nextGameId = lastGame ? (Number(lastGame[0].split(':')[1])+1) : 1
      console.log({nextGameId})
      this.id = nextGameId;
      await this.redis.zadd('game', nextGameId, `game:${nextGameId}`)
      return {id: nextGameId}
    }
  }

  async updateGroupPlayerOne(gid) {
    await this.redis.hset(`game:${this.id}`, 'pone_gid', gid)
  }

  async updateGroupPlayerTwo(gid) {
    await this.redis.hset(`game:${this.id}`, 'ptwo_gid', gid)
  }

  async updateNamePlayerOne(name) {
    await this.redis.hset(`game:${this.id}`, 'pone_name', name)
  }

  async updateNamePlayerTwo(name) {
    await this.redis.hset(`game:${this.id}`, 'ptwo_name', name)
  }

  async updateDeckPlayerOne(deck) {
    await this.redis.hset(`game:${this.id}`, 'pone_deck', deck)
  }

  async updateDeckPlayerTwo(deck) {
    await this.redis.hset(`game:${this.id}`, 'pone_deck', deck)
  }
}

class GameBot {
  constructor() {
    console.log('ok')
    this.redis = new Redis()
    /** @type {WA.Client} */
    this.wa = new WA.Client({
      authStrategy: new WA.LocalAuth(),
      puppeteer: { headless: false },
    });

    this.wa.on('ready', () => {
      console.log('Whatsapp is ready');
    });

    this.wa.on('message', async (msg) => {
      this.preprocessMessage(msg);
      console.log(msg.body)

      if(msg.body.startsWith('new game')) {
        const playerOneWaId = msg.from
        const playerOneInfo = await msg.getContact()

        const playerTwoNumber = msg.body.trim().slice('new game'.length).trim()
        const playerTwoWaId = `${playerTwoNumber}@c.us`
        const playerTwoInfo = await this.wa.getContactById(playerTwoWaId)
        console.log({
          playerOneInfo, playerTwoInfo
        })

        const game = new Game(this.redis);
        await game.create();

        const groupPlayerTwo =  await this.wa.createGroup(`Game #${game.id} vs ${playerOneInfo.pushname}`, [playerTwoWaNumber]);
        const gTwoId = `${groupPlayerTwo.gid.user}@${groupPlayerTwo.gid.server}`

        const chats = await this.wa.getChats()
        console.log({chats})

        await Promise.all([
          game.updateGroupPlayerOne(`${groupPlayerOne.gid.user}@${groupPlayerOne.gid.server}`),
          game.updateGroupPlayerTwo(`${groupPlayerTwo.gid.user}@${groupPlayerTwo.gid.server}`),
          game.updateNamePlayerOne(playerOneInfo.pushname),
          game.updateNamePlayerTwo(playerTwoInfo.pushname)]
        )
      }
    })

    this.wa.initialize()
  }

  /**
   * @param {WA.Message} msg 
   * @returns {WA.Message}
   */
  preprocessMessage(msg) {
    msg.body = msg.body.trim().toLowerCase();
    return msg;
  }
}

(async () => {
  const server =  new GameBot();

})()