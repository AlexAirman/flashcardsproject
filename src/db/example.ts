import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { decksTable, cardsTable } from './schema';

async function main() {
  // Create a new deck for learning Russian
  const newDeck: typeof decksTable.$inferInsert = {
    userId: 'user_example123', // This would be a real Clerk user ID in production
    name: 'Learn Russian',
    description: 'Basic Russian vocabulary for everyday use',
  };

  const [deck] = await db.insert(decksTable).values(newDeck).returning();
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

  await db.insert(cardsTable).values(cards);
  console.log('Cards added to deck!');

  // Get all decks for a user
  const userDecks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, 'user_example123'));
  console.log('User decks:', userDecks);

  // Get all cards in a deck
  const deckCards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deck.id));
  console.log('Cards in deck:', deckCards);

  // Update a card
  await db
    .update(cardsTable)
    .set({
      back: 'Собачка',
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.front, 'Dog'));
  console.log('Card updated!');

  // Delete a deck (will cascade delete all cards)
  await db.delete(decksTable).where(eq(decksTable.id, deck.id));
  console.log('Deck and all its cards deleted!');
}

main();

