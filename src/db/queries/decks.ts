import { eq } from 'drizzle-orm';
import { db } from '../index';
import { decksTable } from '../schema';

/**
 * Get all decks for a specific user
 */
export async function getDecksByUserId(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

/**
 * Get a single deck by ID
 */
export async function getDeckById(deckId: number) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.id, deckId));
  
  return deck;
}

/**
 * Get a single deck by ID and verify ownership (SECURE)
 */
export async function getDeckByIdForUser(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(
      eq(decksTable.id, deckId)
    );
  
  // Verify ownership
  if (deck && deck.userId !== userId) {
    return null;
  }
  
  return deck;
}

/**
 * Create a new deck
 */
export async function createDeck(data: typeof decksTable.$inferInsert) {
  const [deck] = await db
    .insert(decksTable)
    .values(data)
    .returning();
  
  return deck;
}

/**
 * Update an existing deck
 */
export async function updateDeck(
  deckId: number,
  data: Partial<typeof decksTable.$inferInsert>
) {
  const [deck] = await db
    .update(decksTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(decksTable.id, deckId))
    .returning();
  
  return deck;
}

/**
 * Delete a deck (will cascade delete all cards)
 */
export async function deleteDeck(deckId: number) {
  await db
    .delete(decksTable)
    .where(eq(decksTable.id, deckId));
}

