import { Card, Game, Player } from './Classes/Objects.js';
import { setupDeck } from './Classes/setupDeck.js';


(async () => {

  // const deckString = `Pokemon - 10
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
  // 10 Basic Darkness Energy 15`

  // const deckString2 = `Pokemon - 21
  // 1 Alakazam TWM 82
  // 2 Budew PRE 4
  // 1 Conkeldurr TWM 105
  // 1 Fezandipiti ex SFA 38
  // 2 Kyurem SFA 47
  // 2 Natu PAR 71
  // 1 Regigigas PRE 86
  // 4 Slowking SCR 58
  // 3 Slowpoke PRE 18
  // 1 Squawkabilly ex PAF 75
  // 1 Tatsugiri TWM 131
  // 2 Xatu PAR 72
  // Trainer - 28
  // 4 Academy at Night SFA 54
  // 4 Buddy-Buddy Poffin TEF 144
  // 2 Ciphermaniac's Codebreaking TEF 145
  // 1 Counter Catcher PAR 160
  // 2 Drayton SSP 174
  // 2 Iono PAF 80
  // 2 Lana's Aid TWM 155
  // 4 Night Stretcher SFA 61
  // 2 Professor's Research PRE 123
  // 1 Rescue Board TEF 159
  // 4 Ultra Ball BRS 150
  // Energy - 11
  // 6 Basic Psychic Energy 13
  // 4 Jet Energy PAL 190
  // 1 Legacy Energy TWM 167`

  // const deck = await setupDeck(deckString)
  // const deck2 = await setupDeck(deckString2)

  // /**
  //  * @type {Card[]}
  //  */
  // const playerOneDeck = deck.map((cardObject, index) => {
  //   return {
  //     id: index,
  //     card: cardObject,
  //     visibleTo: 'NONE'
  //   }
  // })

  // const playerTwoDeck = deck2.map((cardObject, index) => {
  //   return {
  //     id: index,
  //     card: cardObject,
  //     visibleTo: 'NONE'
  //   }
  // })

  // const game = new Game(
  //   new Player('01', 'Robby', playerOneDeck),
  //   new Player('02', 'Mm', playerTwoDeck)
  // )

  // await game.saveFile()

  let game = await Game.loadFile()

  /**
   * @param card
   */
  function simpleOutput(card) {
    return  `${card.id} - ${card.card.name} - ${card.card.subtype.join(' ')} - ${card.visibleTo}`
  }

  /**
   *
   */
  function print() {
    const area = Object.keys(game.area);
    area.map(e => {
      console.log(e)
      console.log(game.area[e].cards.map(simpleOutput))
    })
  }

  console.log(game.area.playerOneDeck.cards.map(simpleOutput))
  game.shuffle('playerOneDeck')
  console.log(game.area.playerOneDeck.cards.map(simpleOutput))
  game = game.moveCards({
    fromTop: 'playerOneDeck',
    toTop: 'playerOneHand',
    number: 7
  })
  game = game.moveCards({
    fromTop: 'playerOneDeck',
    toTop: 'playerOnePrize',
    number: 6
  })

  game = game.moveCards({
    fromTop: 'playerOneHand',
    toTop: 'playerOneArena',
    number: 1
  })

  print()
})()
