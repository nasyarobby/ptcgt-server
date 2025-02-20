import QR from 'qrcode-terminal';
import WA from 'whatsapp-web.js';
import generatePack from './generatePack.js';
import ioredis from 'ioredis'

const client = new WA.Client({
  authStrategy: new WA.LocalAuth(),
  puppeteer: { headless: false },
});

client.on('qr', (qr) => {
  QR.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Ready');
});

client.on('message', async (msg) => {
  console.log(msg.body);
  console.log(msg.from);
  console.log(msg);

  if (msg.type === 'chat') {
    await createNewGame(msg)
  }
});

/**
 * @param {WA.Message} msg
 */
async function createNewGame(msg) {
  if(msg.body.trim().startsWith('new game')) {
    const opponent = msg.body.trim().slice('new game'.length).trim()
    const playerOneInfo = await msg.getContact()
    const group =  await client.createGroup(`Game #1 vs ${playerOneInfo.pushname}`, [`${opponent}@c.us`]);
    console.log({group: group.gid})
    console.log({groups:await client.getContactById('120363383505015543@g.us')})
    console.log({
      chats: (await client.getChats()).map(c => {
        return c.id
      })
    })

    console.log()

  }
}

client.initialize();
