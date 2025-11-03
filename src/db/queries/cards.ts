import { eq } from 'drizzle-orm';
import { db } from '../index';
import { cardsTable } from '../schema';

/**
 * Get all cards in a specific deck
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
}

/**
 * Get a single card by ID
 */
export async function getCardById(cardId: number) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId));
  
  return card;
}

/**
 * Create a new card
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
 * Update a card by matching front text (for example purposes)
 */
export async function updateCardByFront(
  front: string,
  data: Partial<typeof cardsTable.$inferInsert>
) {
  const [card] = await db
    .update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.front, front))
    .returning();
  
  return card;
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: number) {
  await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

