'use server';

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdForUser, updateDeck } from "@/db/queries/decks";
import { z } from "zod";

// Validation schemas
const updateDeckSchema = z.object({
  deckId: z.number(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

// Update deck action
export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = updateDeckSchema.parse(input);

    // Verify ownership
    const deck = await getDeckByIdForUser(validated.deckId, userId);
    
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // Update the deck
    const updatedDeck = await updateDeck(validated.deckId, {
      name: validated.name,
      description: validated.description,
    });

    revalidatePath(`/decks/${validated.deckId}`);
    revalidatePath('/dashboard');

    return { success: true, data: updatedDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update deck" };
  }
}

