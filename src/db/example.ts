import 'dotenv/config';
import { decksTable, cardsTable } from './schema';
import {
  createDeck,
  getDecksByUserId,
  deleteDeck,
} from './queries/decks';
import {
  createCards,
  getCardsByDeckId,
  updateCardByFront,
} from './queries/cards';

async function main() {
  // Create a new deck for learning Russian
  const newDeck: typeof decksTable.$inferInsert = {
    userId: 'user_example123', // This would be a real Clerk user ID in production
    name: 'Learn Russian',
    description: 'Basic Russian vocabulary for everyday use',
  };

  const deck = await createDeck(newDeck);
  console.log('New deck created!', deck);

  // Add cards to the deck
  const cards: typeof cardsTable.$inferInsert[] = [
    {
      deckId: deck.id,
      front: 'Dog',
      back: 'Собака',
    },
    {
      deckId: deck.id,
      front: 'Cat',
      back: 'Кошка',
    },
    {
      deckId: deck.id,
      front: 'Hello',
      back: 'Привет',
    },
  ];

  await createCards(cards);
  console.log('Cards added to deck!');

  // Get all decks for a user
  const userDecks = await getDecksByUserId('user_example123');
  console.log('User decks:', userDecks);

  // Get all cards in a deck
  const deckCards = await getCardsByDeckId(deck.id);
  console.log('Cards in deck:', deckCards);

  // Update a card
  await updateCardByFront('Dog', {
    back: 'Собачка',
  });
  console.log('Card updated!');

  // Delete a deck (will cascade delete all cards)
  await deleteDeck(deck.id);
  console.log('Deck and all its cards deleted!');
}

main();

