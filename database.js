import { JSONFilePreset } from 'lowdb/node';

export class DatabaseClass {
  constructor() {
    // Read or create db.json
    this.db = null;
  }

  async init() {
    /**
     * @type {{cards: import('./types').CardType[]}}
     */
    const defaultData = { cards: [] }
    this.db = await JSONFilePreset('db.json', defaultData)
    return this;
  }
}

const Database = new DatabaseClass().init();

export default Database;