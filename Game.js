import { Player } from './Classes/Objects.js';
import { setupDeck } from './Classes/setupDeck.js';

export default class Game {
  constructor() {
    this.player = []
  }
  /**
   * @param {Player} player 
   */
  addPlayer(player) {
    if(this.player.length < 2) {
      this.player.push(player)
    }
    else {
      throw new Error('There are already 2 players in this game.')
    }
  }
}

(async () => {
  const game = new Game();
  const deckString = `Pokemon - 10
1 Latias ex SSP 76
4 Roaring Moon TEF 109
4 Roaring Moon ex PAR 124
1 Squawkabilly ex PAL 169
Trainer - 40
4 Ancient Booster Energy Capsule TEF 140
4 Arven SVI 166
2 Boss’s Orders (Ghetsis) PAL 172
4 Dark Patch ASR 139
4 Earthen Vessel PAR 163
4 Explorer's Guidance TEF 147
4 Nest Ball SVI 181
2 PokéStop PGO 68
4 Professor Sada's Vitality PAR 170
1 Scoop Up Cyclone TWM 162
4 Trekking Shoes ASR 156
3 Ultra Ball SVI 196
Energy - 10
10 Basic Darkness Energy 15`

  const deck = await setupDeck(deckString)
  game.addPlayer(new Player(1, 'Robby', deck))
})()