
/**
 * Generates a random integer between two integers (inclusive).
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} A random integer between min and max.
 */
export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random integer with weighted data.
 * @param {Array<{ value: number, weight: number }>} data - An array of objects with value and weight properties.
 * @returns {number} A random value from the data array, weighted by the weight property.
 */
export function randomWeightedInteger(data) {
  const totalWeight = data.reduce((acc, { weight }) => acc + weight, 0);
  const random = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const { value, weight } of data) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      return value;
    }
  }

  // If no value is selected, return the last value (this should never happen)
  return data[data.length - 1].value;
}
