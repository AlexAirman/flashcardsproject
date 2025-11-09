import { eq, desc } from 'drizzle-orm';
import { db } from '../index';
import { cardsTable } from '../schema';

/**
 * Get all cards in a specific deck (sorted by updatedAt, latest first)
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

/**
 * Create a new card
 * Note: Deck ownership should be verified before calling this function
 */
export async function createCard(data: typeof cardsTable.$inferInsert) {
  const [card] = await db
    .insert(cardsTable)
    .values(data)
    .returning();
  
  return card;
}

/**
 * Create multiple cards at once
 */
export async function createCards(cards: (typeof cardsTable.$inferInsert)[]) {
  return await db
    .insert(cardsTable)
    .values(cards)
    .returning();
}

/**
 * Update an existing card
 * Note: Deck ownership should be verified before calling this function
 */
export async function updateCard(
  cardId: number,
  data: Partial<typeof cardsTable.$inferInsert>
) {
  const [card] = await db
    .update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return card;
}

/**
 * Delete a card
 * Note: Deck ownership should be verified before calling this function
 */
export async function deleteCard(cardId: number) {
  await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

