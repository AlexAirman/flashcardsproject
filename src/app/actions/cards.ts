'use server';

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdForUser } from "@/db/queries/decks";
import { createCard, updateCard } from "@/db/queries/cards";
import { z } from "zod";

// Validation schemas
const createCardSchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front side is required").max(1000),
  back: z.string().min(1, "Back side is required").max(1000),
});

const updateCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
  front: z.string().min(1, "Front side is required").max(1000),
  back: z.string().min(1, "Back side is required").max(1000),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

// Create card action
export async function createCardAction(input: CreateCardInput) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = createCardSchema.parse(input);

    // Verify deck ownership
    const deck = await getDeckByIdForUser(validated.deckId, userId);
    
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // Create the card
    const card = await createCard({
      deckId: validated.deckId,
      front: validated.front,
      back: validated.back,
    });

    revalidatePath(`/decks/${validated.deckId}`);
    revalidatePath('/dashboard');

    return { success: true, data: card };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create card" };
  }
}

// Update card action
export async function updateCardAction(input: UpdateCardInput) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = updateCardSchema.parse(input);

    // Verify deck ownership (cards belong to decks)
    const deck = await getDeckByIdForUser(validated.deckId, userId);
    
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // Update the card
    const card = await updateCard(validated.cardId, {
      front: validated.front,
      back: validated.back,
    });

    revalidatePath(`/decks/${validated.deckId}`);
    revalidatePath('/dashboard');

    return { success: true, data: card };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update card" };
  }
}

