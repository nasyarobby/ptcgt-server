export class Player {
  /**
   * @param {string} id 
   * @param {string} name 
   */
  constructor(id, name) {
    /** @type {string} */
    this.id = id;

    /** @type {string} */
    this.name = name;
  }
}

export class PlayArea {
  /**
   * @param {object} param
   * @param {string | undefined} param.name
   * @param {Player | undefined} param.owner 
   * @param {"owner" | "public" | "none"} param.defaultVisibleTo
   * @param param.visibleTo
   */
  constructor({name, owner, defaultVisibleTo, visibleTo}) {
    /** @type {string} */
    this.name = name;

    /** @type {Player|null} */
    this.owner = owner ;

    this.defaultVisibleTo = defaultVisibleTo;

    this.cards = []

  }
}

export class CardMarker {
  constructor(name, value) {
    this.name = 'marker'
    this.value = value || ''
  }
}

class DamageMarker extends CardMarker {
  constructor() {
    super('damage', '0')
  }
}

export class Card {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {string} params.ptcgLabel
   * @param {string} params.owner
   */
  constructor({id, ptcgLabel, owner}) {
    /**
     * @type {Player} 
     */

    this.owner = owner

    /**
     * @type {string}
     */
    this.id = id

    /**
     * @type {string}
     */
    this.ptcgLabel = ptcgLabel

    /**
     * @type {string | null}
     */
    this.url = null

    /**
     * @type {Card[]}
     */
    this.attachments = []

    /**
     * @type {CardMarker[]}
     */
    this.markers = []
  }
}

export default class PTCGT {
  constructor() {
    /**
     * @type {string}
     */
    this.logs = []
  }
}

