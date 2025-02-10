import { JSONFilePreset } from 'lowdb/node'

/**
 * @param {import('./types').CardType[]} data
 */
export default async function saveSetData(data) {

  // Read or create db.json
  const defaultData = { cards: [] }
  const db = await JSONFilePreset('db.json', defaultData)

  // Update db.json
  data.forEach(async (card) => {
    return db.data.cards.push(card);
  })

  await db.write()
}