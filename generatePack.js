import ApiClient from './Api.js';
import createPackResult from './createPackResult.js';
import Database from './database.js';
import { randomWeightedInteger } from './randomize.js';

/**
 * @param setName
 */
export default async function generatePack(setName) {
  const database = await Database;
  const rarityVary = new Set(database.db.data.cards.filter(c => c.set.ptcgoCode ===setName).map(c => c.rarity))
  console.log({rarityVary})

  /**
   * @param {number} numOfCards
   * @returns {import('./types.js').CardType[]}
   */
  function getCommonCards(numOfCards) {
    const cards = []
    for (let i = 0; i < numOfCards; i++) {
      cards.push(pickOneCard([{
        value: 'Common',
        weight: 1
      }]))
    }
    return cards;
  }

  /**
   * @param {number} numOfCards
   * @returns {import('./types.js').CardType[]}
   */
  function getUncommonCards(numOfCards) {
    const cards = []
    for (let i = 0; i < numOfCards; i++) {
      cards.push(pickOneCard([{
        value: 'Uncommon',
        weight: 1
      }]))
    }
    return cards;
  }

  /**
   * @param {string[]} rarities
   */
  function pickOneCard(rarities) {
    const rarity = randomWeightedInteger(rarities)
    const cards = database.db.data.cards.filter(c => c.set.ptcgoCode === setName && c.rarity === rarity)

    const cardId = randomWeightedInteger(cards.map(c => {
      return {
        value: c.id,
        weight: 1
      }
    }))

    return cards.find(c => c.id === cardId)
  }

  const rarities = {
    PRE: [
      'Common',
      'Uncommon',
      'Double Rare',
      'Rare',
      'ACE SPEC Rare',
      'Ultra Rare',
      'Special Illustration Rare',
      'Hyper Rare'
    ]
  }

  if(setName === 'PAF') {
    const files = await [
      ...getCommonCards(4),
      ...getUncommonCards(3),
      pickOneCard([
        {
          value: 'Uncommon',
          weight: (10000-2544-772)/2
        },
        {
          value: 'Common',
          weight: (10000-2544-772)/2
        },
        {
          value: 'Shiny Rare',
          weight: 2544
        },
        {
          value: 'Shiny Ultra Rare',
          weight: 772
        }]),
      pickOneCard([
        {
          value: 'Uncommon',
          weight: (10000-1589-172)/2
        },
        {
          value: 'Common',
          weight: (10000-1589-172)/2
        },
        {
          value: 'Illustration Rare',
          weight: 1589
        },
        {
          value: 'Special Illustration Rare',
          weight: 172
        },
        {
          value: 'Hyper Rare',
          weight: 100
        }]),
      pickOneCard([
        {
          value: 'Rare',
          weight: 10000-1589-661,
        },
        {
          value: 'Double Rare',
          weight: 1589
        },{
          value: 'Ultra Rare',
          weight: 661
        }])
    ]
      .reduce(async (prev, card) => {
        console.log(`${card.name} - ${card.rarity} `+`(${card.number}/${card.set.printedTotal})`)
        const accData = await prev;
        const client = new ApiClient()
        const filename=`./${card.id}.png`
        await client.downloadImage(card.images.large, filename)
        return [...accData, filename]
      }, Promise.resolve([]))
    await createPackResult(files)
  }


  if(setName === 'PRE') {

    const packRarity = randomWeightedInteger([
      {
        value: 'common', weight: 950
      },
      {
        value: 'demi-god', weight: 4
      },
      {
        value: 'god', weight: 1
      }
    ])

    console.log({packRarity})

    if(packRarity === 'god') {

    }

    const files = [
      ...getCommonCards(4),
      ...getUncommonCards(3),
      pickOneCard([
        {
          value: 'Uncommon',
          weight: (10000-2544-772)/2
        },
        {
          value: 'Common',
          weight: (10000-2544-772)/2
        },
        {
          value: 'Ultra Rare',
          weight: 772
        }]),
      pickOneCard([
        {
          value: 'Uncommon',
          weight: (10000-1589-172)/2
        },
        {
          value: 'Common',
          weight: (10000-1589-172)/2
        },
        {
          value: 'Special Illustration Rare',
          weight: 172
        },
        {
          value: 'Hyper Rare',
          weight: 100
        }]),
      pickOneCard([
        {
          value: 'Rare',
          weight: 10000-1589-661,
        },
        {
          value: 'Double Rare',
          weight: 1589
        },{
          value: 'Ultra Rare',
          weight: 661
        }])
    ]
      .reduce(async (prev, card) => {
        console.log(`${card.name} - ${card.rarity} `+`(${card.number}/${card.set.printedTotal})`)
        const accData = await prev;
        const client = new ApiClient()
        const filename=`./${card.id}.png`
        await client.downloadImage(card.images.large, filename)
        return [...accData, filename]
      }, Promise.resolve([]))
    await createPackResult(files)
  }
}

generatePack('PRE')