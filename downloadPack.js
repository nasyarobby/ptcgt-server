import ApiClient from './Api.js';
import saveSetData from './saveSetData.js';

/**
 *
 */
async function downloadPack() {
  const client = new ApiClient();
  const set = await client.getSetByPtcgo('PRE');
  const setId = set.data[0].id
  const cards = await client.searchCardByQuery(`set.id:${setId}`)
  saveSetData(cards.data)
}

downloadPack();