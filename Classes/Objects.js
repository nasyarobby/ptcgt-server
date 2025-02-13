import { readFile, writeFile } from 'fs/promises';

export class Card {
  /**
   * @param {string} id 
   * @param {import(".").SimpleCardType} cardObject 
   */
  constructor(id, cardObject) {
    /**
     * @type {import(".").VisibilityType}
     */
    this.visibleTo = 'NONE'
    this.id = id
    this.card = cardObject
  }
}

export class Area {
  /**
   * @param {Player | null} owner 
   * @param {import('.').AreaName} areaName 
   * @param {{onInsertCard?: (card: Card) => Card} | undefined} config
   * @param {Card[]} cards 
   */
  constructor(owner, areaName, cards, config) {
    this.owner = owner;
    /** @type {import('.').AreaName} */
    this.name = areaName;
    this.cards = cards;
    /** @type {((card: Card) => Card) | null}  */
    this.onInsertCard = config?.onInsertCard || null;
  }

  /**
   * @param {Card[]} cards 
   * @returns {Area}
   */
  insertCardsToTop(cards) {
    let cardsInput  = (this.onInsertCard) ? cards.map(this.onInsertCard) : cards;
    this.cards = [...cardsInput, ...this.cards]
    return this;
  }

  /**
   * @param {Card[]} cards 
   * @returns {Area}
   */
  insertCardsToBottom(cards) {
    let cardsInput  = (this.onInsertCard) ? cards.map(this.onInsertCard) : cards;
    this.cards = [...this.cards, ...cardsInput]
    return this;
  }
}

export class Player {
  /**
   * @param {string} playerId 
   * @param {string} playerName 
   * @param {Card[]} deck 
   */
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
      playerOneHand: new Area(player1, 'playerOneHand', []),
      playerOneDeck: new Area(player1, 'playerOneDeck', this.player1.deck),
      playerOneTrash: new Area(player1, 'playerOneTrash', []),
      playerOneLostZone: new Area(player1, 'playerOneLostZone', []),
      playerOneArena: new Area(player1, 'playerOneArena', []),
      playerOnePlayground: new Area(player1, 'playerOnePlayground', []),
      playerOnePrize: new Area(player1, 'playerOnePrize', []),
      playerTwoHand: new Area(player2, 'playerTwoHand', []),
      playerTwoDeck: new Area(player2, 'playerTwoDeck', this.player2.deck),
      playerTwoTrash: new Area(player2, 'playerTwoTrash', []),
      playerTwoLostZone: new Area(player2, 'playerTwoLostZone', []),
      playerTwoArena: new Area(player2, 'playerTwoArena', []),
      playerTwoPlayground: new Area(player2, 'playerTwoPlayground', []),
      playerTwoPrize: new Area(player2, 'playerTwoPrize', []),
      stadium: new Area(null, 'stadium', []),
    }
  }

  /**
   * @param {import(".").AreaName} area
   * @returns {Game}
   */
  shuffle(area) {
    const array = this.area[area].cards
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return this
  }

  /**
   * @param {{
   * fromTop?: import('.').AreaName,
   * fromBottom?: import('.').AreaName,
   * toTop?: import('.').AreaName,
   * toBottom?: import('.').AreaName,
   * number: number
   * }} args
   * @returns {Game}
   */
  moveCards({
    fromBottom,
    toBottom,
    fromTop,
    toTop,
    number

  }) {
    if(fromTop ) {
      let [cards, rest] = this.lookCardsFromTop(fromTop, number)
      if(toTop)
        this.area[toTop].insertCardsToTop(cards)
      else if(toBottom)
        this.area[toBottom].insertCardsToBottom(cards)

      this.area[fromTop].cards = rest;
      return this;
    }

    else if(fromBottom) {
      let [cards, rest] = this.lookCardsFromTop(fromBottom, number)
      if(toTop)
        this.area[toTop].insertCardsToTop(cards)
      else if(toBottom)
        this.area[toBottom].insertCardsToBottom(cards)

      this.area[fromBottom].cards = rest;
      return this;
    }

    return this;
  }

  /**
   * @param {import('.').AreaName} areaName 
   * @param {number} number 
   * @returns {[Card[], Card[]]}
   */
  lookCardsFromTop(areaName, number) {
    /**
     * @type {Area}
     */
    const area = this.area[areaName]
    const firstN = area.cards.slice(0, number);
    const rest = area.cards.slice(number);

    return [firstN, rest];
  }

  /**
   * @param {import('.').AreaName} areaName 
   * @param {number} number 
   * @returns {[Card[], Card[]]}
   */
  lookCardsFromBottom(areaName, number) {
    /**
     * @type {Area}
     */
    const area = this.area[areaName]
    const firstN = area.cards.slice(0, area.cards.length - number);
    const rest = area.cards.slice(area.cards.length - number).reverse();

    return [rest, firstN];
  }

  /**
   * @param {{
   * id: string | number,
   * from: import('.').AreaName,
   * toBottom?:  import('.').AreaName,
   * toTop?:  import('.').AreaName,
   * }} args
   * @returns {Game}
   * @throws {Error}
   */
  moveSpecificCardByCardId(args) {
    const area = this.area[args.from];
    const cardIndex = area.cards.findIndex(c => c.card.id.toString() === args.id.toString() || c.id.toString() === args.id.toString())
    console.log(args)
    if(cardIndex === -1) {
      throw new Error('Cannot find card.')
    }

    const card = area.cards[cardIndex];
    this.area[args.from].cards[cardIndex] = null
    this.area[args.from].cards = this.area[args.from].cards.filter(e => !!e)
    if(args.toTop) {
      this.area[args.toTop].insertCardsToTop([card])
    }
    else if(args.toBottom) {
      this.area[args.toBottom].insertCardsToBottom([card])
    }
    return this
  }

  async saveFile() {
    const keys = Object.keys(this.area);

    const cards = {}
    this.player1.deck.forEach(c => {
      cards[c.card.id] = {
        id: c.card.id,
        imageL: c.card.images.large,
        imageS: c.card.images.small,
        name: c.card.name,
        subtype: c.card.subtypes,
        type: c.card.types,
        supertype: c.card.supertype
      }
    })

    this.player2.deck.forEach(c => {
      cards[c.card.id] = {
        id: c.card.id,
        imageL: c.card.images.large,
        imageS: c.card.images.small,
        name: c.card.name,
        subtype: c.card.subtypes,
        type: c.card.types,
        supertype: c.card.supertype
      }
    })

    const areas = keys.map(k => {
      /** @type {Area} */
      const area = this.area[k]
      return {
        name: k,
        data: {
          o: area.owner?.id || null,
          c: area.cards.map(c => {
            return {
              id: c.id,
              v: c.visibleTo,
              c: c.card.id
            }
          })
        }
      }
    })

    return writeFile('state.json', JSON.stringify({
      playerOne: {
        id: this.player1.id,
        name: this.player1.name
      },
      playerTwo: {
        id: this.player2.id,
        name: this.player2.name
      },
      cards,
      area: areas,
    }, ' ', 2))

  }

  /**
   * @returns {Promise<Game>}
   */
  static async loadFile() {
    const dataBuffer = await readFile('state.json', 'utf-8');
    /** @type {{area: Area[]}} */
    const data = JSON.parse(dataBuffer)
    const game = new Game(
      new Player(data.playerOne.id, data.playerOne.name, []), 
      new Player(data.playerOne.id, data.playerOne.name, []))

    data.area.forEach(area => {
      let fn = null;
      if(area.name === 'playerOneArena') {
        fn = (c) => ({
          ...c, visibleTo: 'ALL'
        })
      }

      if(area.name === 'playerOneDeck') {
        fn = (c) => ({
          ...c, visibleTo: 'NONE'
        })
      }

      if(area.name === 'playerOneHand') {
        fn = (c) => ({
          ...c, visibleTo: 'PLAYER_ONE'
        })
      }

      if(area.name === 'playerOnePrize') {
        fn = (c) => ({
          ...c, visibleTo: 'NONE'
        })
      }

      if(area.name === 'playerOneTrash') {
        fn = (c) => ({
          ...c, visibleTo: 'ALL'
        })
      }

      game.area[area.name] = new Area(game.player1.id === area.data.o ? game.player1 : game.player2, area.name, area.data.c.map(c => {
        const cardInfo = data.cards[c.c]
        /** @type {Card} */
        const card = {
          id: c.id, visibleTo: c.v, card: cardInfo
        }
        return card;
      }), {onInsertCard: fn})
    })
    console.log(game)
    return game;
  }
}