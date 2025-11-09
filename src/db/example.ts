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
  updateCard,
} from './queries/cards';

async function main() {
  const exampleUserId = 'user_example123'; // This would be a real Clerk user ID in production
  
  // Create a new deck for learning Russian
  const newDeck: typeof decksTable.$inferInsert = {
    userId: exampleUserId,
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

  const createdCards = await createCards(cards);
  console.log('Cards added to deck!');

  // Get all decks for a user
  const userDecks = await getDecksByUserId(exampleUserId);
  console.log('User decks:', userDecks);

  // Get all cards in a deck
  const deckCards = await getCardsByDeckId(deck.id);
  console.log('Cards in deck:', deckCards);

  // Update a card (find the "Dog" card first)
  const dogCard = createdCards.find(c => c.front === 'Dog');
  if (dogCard) {
    await updateCard(dogCard.id, {
      back: 'Собачка',
    });
    console.log('Card updated!');
  }

  // Delete a deck (will cascade delete all cards)
  // IMPORTANT: Always pass userId to verify ownership
  await deleteDeck(deck.id, exampleUserId);
  console.log('Deck and all its cards deleted!');
}

main();

