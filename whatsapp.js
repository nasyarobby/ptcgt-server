import QR from 'qrcode-terminal'
import WA from 'whatsapp-web.js'
import generatePack from './generatePack.js'

const client = new WA.Client({
  authStrategy: new WA.LocalAuth(), 
  puppeteer: {headless: false}
})

client.on('qr', (qr) => {
  QR.generate(qr, {small: true})
})

client.on('ready', () => {
  console.log('Ready')
})

client.on('message', async (msg) => {
  console.log(msg.body)
  console.log(msg.from)
  if(msg.body === 'open pack' || msg.body === '@6287778226193 open pack') {
    msg.reply('OK. Opening a pack...')
    const cards = await generatePack('PAF')
    if(cards) {
      const caption = `You got 
${cards.map(c => `${c.name} - ${c.rarity} (${c.number}/${c.set.printedTotal})`).join('\n')}`
      await msg.reply(WA.MessageMedia.fromFilePath('./pack.png'))
    }
  }
  

})

client.initialize()