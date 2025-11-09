import { eq, and } from 'drizzle-orm';
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
 * Get a single deck by ID and verify ownership (SECURE)
 * ALWAYS filters by both deckId AND userId to ensure data isolation
 */
export async function getDeckByIdForUser(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId) // REQUIRED - verify ownership
      )
    );
  
  return deck || null;
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
 * REQUIRES both deckId AND userId for security
 */
export async function updateDeck(
  deckId: number,
  userId: string,
  data: Partial<typeof decksTable.$inferInsert>
) {
  const [deck] = await db
    .update(decksTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId) // REQUIRED - verify ownership
      )
    )
    .returning();
  
  return deck;
}

/**
 * Delete a deck (will cascade delete all cards)
 * REQUIRES both deckId AND userId for security
 */
export async function deleteDeck(deckId: number, userId: string) {
  await db
    .delete(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId) // REQUIRED - verify ownership
      )
    );
}

