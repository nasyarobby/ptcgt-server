import ApiClient from '../Api.js';

/**
 * @param {string} deckString
 * @param {{onCardFound: (text: string, card: import('../types.js').CardListResponse,
 * index: number, arr: string[]) => void}} arg 
 * @returns {Promise<import('../types.js').CardType[]>}
 */
export async function setupDeck(deckString, arg) {
  const lines = deckString.split('\n').filter(e => e.trim() !== '');

  const data = await lines.reduce(async (prev, line, index, arr) => {
    const acc = await prev
    const tokens = line.split(' ').map(e => e.trim()).filter(e => !!e);
    const firstToken = tokens[0]
    const setNumber = tokens[tokens.length -1]
    const setPtcgoCode = tokens[tokens.length -2]
    if(isNaN(Number(firstToken))) {
      return {
        data: acc.data,
        section: firstToken
      };
    }
    const setData = await new ApiClient().getSetByPtcgo(setPtcgoCode);
    console.log(setPtcgoCode)
    const cardData =  (acc.section === 'Energy' && setPtcgoCode === 'Energy') ? 
      await (async () => {
        try {
          return await new ApiClient().getCardById(`sve-${setNumber}`)
        }
        catch(err) {
          return new ApiClient().getCardById(`swsh12pt5-${setNumber}`)
        }
      })()
      :
      await new ApiClient().getCardById(`${setData.data[0].id}-${setNumber}`) 

    if(arg?.onCardFound)
      arg.onCardFound(line, cardData, index, arr)

    return {
      data: [...acc.data, {
        count: Number(firstToken),
        line,
        data: cardData.data,
        setNumber,
        setPtcgoCode,
      }], section: acc.section
    }
  }, Promise.resolve({
    data: [], section: ''
  }))

  return data.data.reduce((acc, curr) => {
    const cards = []

    for (let i = 0; i < curr.count; i++) {
      cards.push(curr.data)
    }

    return [...acc, ...cards]
  }, [])
}

// const str = `Pokemon - 10
// 1 Latias ex SSP 76
// 4 Roaring Moon TEF 109
// 4 Roaring Moon ex PAR 124
// 1 Squawkabilly ex PAL 169
// Trainer - 40
// 4 Ancient Booster Energy Capsule TEF 140
// 4 Arven SVI 166
// 2 Boss’s Orders (Ghetsis) PAL 172
// 4 Dark Patch ASR 139
// 4 Earthen Vessel PAR 163
// 4 Explorer's Guidance TEF 147
// 4 Nest Ball SVI 181
// 2 PokéStop PGO 68
// 4 Professor Sada's Vitality PAR 170
// 1 Scoop Up Cyclone TWM 162
// 4 Trekking Shoes ASR 156
// 3 Ultra Ball SVI 196
// Energy - 10
// 10 Basic Darkness Energy 15
// `



// setupDeck(str).then(console.log)