'use server';

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdForUser, updateDeck, createDeck, deleteDeck } from "@/db/queries/decks";
import { z } from "zod";

// Validation schemas
const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

const updateDeckSchema = z.object({
  deckId: z.number(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

const deleteDeckSchema = z.object({
  deckId: z.number(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export type CreateDeckResult = 
  | { success: true; data: any }
  | { success: false; error: string; requiresUpgrade?: boolean };

// Create deck action
export async function createDeckAction(input: CreateDeckInput): Promise<CreateDeckResult> {
  try {
    const { userId, has } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has unlimited decks feature
    const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
    
    if (!hasUnlimitedDecks) {
      // Free users are limited to 3 decks
      const { getDecksByUserId } = await import("@/db/queries/decks");
      const existingDecks = await getDecksByUserId(userId);
      
      if (existingDecks.length >= 3) {
        return { 
          success: false, 
          error: "You've reached the 3 deck limit on the free plan. Upgrade to Pro for unlimited decks!",
          requiresUpgrade: true
        };
      }
    }

    // Validate input
    const validated = createDeckSchema.parse(input);

    // Create the deck
    const newDeck = await createDeck({
      userId,
      name: validated.name,
      description: validated.description || null,
    });

    revalidatePath('/dashboard');

    return { success: true, data: newDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create deck" };
  }
}

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
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update deck" };
  }
}

// Delete deck action
export async function deleteDeckAction(input: DeleteDeckInput) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = deleteDeckSchema.parse(input);

    // Verify ownership
    const deck = await getDeckByIdForUser(validated.deckId, userId);
    
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // Delete the deck (will cascade delete all cards)
    await deleteDeck(validated.deckId);

    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to delete deck" };
  }
}

