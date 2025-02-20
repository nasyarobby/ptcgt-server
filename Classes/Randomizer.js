import seedrandom from 'seedrandom';

export default class Randomizer {
  constructor(seed) {
    this.seed = seed;
  }

  /**
   * @param {number|string} turn
   * @returns {number}
   */
  rng(turn) {
    return seedrandom(`${this.seed}-${turn}`)();
  }

  /**
   * 
   * @param {any[]} arr 
   * @param {number|string} turn
   * @returns {any[]}
   */
  shuffle(arr, turn) {
    const array = arr
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng(turn) * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array
  }
}
