import axios from 'axios';
import { createWriteStream } from 'fs';

export default class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.pokemontcg.io/v2',
      headers: {'X-API-KEY': process.env.API_KEY}
    }) 

  }

  /**
   * @param {string} setName 
   * @returns {Promise<import("./types").SetListResponse>}
   */
  async getSetByPtcgo(setName) {
    const response = await this.client.get('/sets/', {params: {q: `ptcgoCode:${setName}`}})
    return response.data;
  }

  async getSetById(id) {
    const response = await this.client.get(id)
    return response.data;
  }

  /**
   * @param {string} query 
   * @returns {Promise<import("./types").CardListResponse>}
   */
  async searchCardByQuery(query) {
    const response = await this.client.get('/cards', {params: {q: query}})

    return response.data;

  }

  /**
   * @param {string} url 
   * @param {string} path
   * @returns {Promise<any>}
   */
  async downloadImage(
    url,
    path,
  ) {
    const writer = createWriteStream(path);
    return this.client.get(url, {responseType: 'stream',})
      .then((response) => new Promise((res, rej) => {
        response.data.pipe(writer);
        let error = null;

        writer.on('error', (err) => {
          error = err;
          writer.close();
          rej(err);
        });

        writer.on('close', () => {
          if (!error) res(true);
        });
      }));
  }
}