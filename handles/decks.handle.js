import PlayerMessage from '../Classes/PlayerMessage.js';
import redis from '../Classes/Redis.js';
import { setupDeck } from '../Classes/setupDeck.js';

/**
 * @param pid
 * @returns {Promise<string[]>}
 */
function getDecks(pid) {
  return redis.hgetall(`ptcgt:decks:${pid}`);
}

/**
 * @param {string} pid
 * @param {string} deckName
 * @param {string} deckstring
 * @param {string} deckData
 * @returns {Promise<number>}
 */
function saveDeck(pid, deckName, deckstring, deckData) {
  const cards = {};
  deckData.forEach((card) => {
    delete card.artist;
    delete card.cardmarket;
    delete card.nationalPokedexNumbers, delete card.rarity;
    delete card.set;
    delete card.tcgplayer;
    delete card.flavorText;
    cards[card.id] = card;
  });

  const deck = deckData.map((card, index) => {
    return {
      no: `c-${index}`,
      id: card.id,
      v: 'N',
    };
  });
  return redis.hset(
    `ptcgt:decks:${pid}`,
    deckName || 'default',
    JSON.stringify({
      deck,
      cards,
      deckstring,
    })
  );
}

/**
 * @param {PlayerMessage} message
 */
export default async function handleDecks(message) {
  if (message.cmd === 'save_deck') {
    console.log(message)
    message.player.ws.sendCmd('s_pending_save_deck', {} );
    const deck = await setupDeck(message.data.deck, {
      onCardFound: (line, card, index, arr) => {
        message.player.ws.sendCmd('s_card_found',{
          line,
          card,
          index,
          count: arr.length,
        }
        );
      },
    });

    await saveDeck(message.player.id, message.data.deckName, message.data.deck, deck);

    message.player.ws.sendCmd('s_ok_save_deck',
      { deck: deck },
    )
  }

  if (message.cmd === 'get_decks') {
    const decks = await getDecks(message.player.id);
    console.log({decks})
    message.player.ws.send(
      JSON.stringify({
        c: 's_ok_get_decks',
        d: {
          decks: Object.keys(decks).map((name) => {
            return {
              name,
              data: JSON.parse(decks[name]),
            };
          }),
        },
      })
    );
  }
}