export class Card {
  constructor() {
    /**
     * @type {import(".").VisibilityType}
     */
    this.visibleTo = 'NONE'
  }
}

export class Area {
  /**
   * @param {Player | null} owner 
   * @param {string} areaName 
   * @param {Card[]} cards 
   */
  constructor(owner, areaName, cards) {
    this.owner = owner;
    this.name = areaName;
    this.cards = cards;
  }
}

export class Player {
  constructor(playerId, playerName, deck) {
    this.id = playerId;
    this.name = playerName;
    this.deck = deck;
  }
}

export class Game {
  /**
   * @param {Player} player1 
   * @param {Player} player2 
   */
  constructor(player1, player2) {
    /** @type {Player} */
    this.player1 = player1

    /** @type {Player} */
    this.player2 = player2

    this.area = {
      playerOneHand: new Area(player1, '', []),
      playerOneDeck: new Area(player1, '', this.player1.deck),
      playerOneTrash: new Area(player1, '', []),
      playerOneLostZone: new Area(player1, '', []),
      playerOneArena: new Area(player1, '', []),
      playerOnePlayground: new Area(player1, '', []),
      playerOnePrize: new Area(player1, '', []),
      playerTwoHand: new Area(player2, '', []),
      playerTwoDeck: new Area(player2, '', this.player2.deck),
      playerTwoTrash: new Area(player2, '', []),
      playerTwoLostZone: new Area(player2, '', []),
      playerTwoArena: new Area(player2, '', []),
      playerTwoPlayground: new Area(player2, '', []),
      playerTwoPrize: new Area(player2, '', []),
      stadium: new Area(),
    }
  }
}