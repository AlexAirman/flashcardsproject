'use server';

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdForUser } from "@/db/queries/decks";
import { createCard, updateCard, deleteCard } from "@/db/queries/cards";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

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

const deleteCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
});

const generateCardsSchema = z.object({
  deckId: z.number(),
  deckName: z.string(),
  deckDescription: z.string().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
export type GenerateCardsInput = z.infer<typeof generateCardsSchema>;

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

// Delete card action
export async function deleteCardAction(input: DeleteCardInput) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = deleteCardSchema.parse(input);

    // Verify deck ownership (cards belong to decks)
    const deck = await getDeckByIdForUser(validated.deckId, userId);
    
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // Delete the card
    await deleteCard(validated.cardId);

    revalidatePath(`/decks/${validated.deckId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to delete card" };
  }
}

// Generate cards with AI action
export async function generateCardsWithAIAction(input: GenerateCardsInput) {
  try {
    const { userId, has } = await auth();
    
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check for AI generation feature (Pro plan)
    if (!has({ feature: 'ai_flashcard_generation_feature' })) {
      return { success: false, error: "AI generation requires Pro plan" };
    }

    // Validate input
    const validated = generateCardsSchema.parse(input);

    // Verify deck ownership
    const deck = await getDeckByIdForUser(validated.deckId, userId);
    
    if (!deck) {
      return { success: false, error: "Deck not found or access denied" };
    }

    // Require a meaningful description for AI generation
    if (!validated.deckDescription || validated.deckDescription.trim().length < 10) {
      return { 
        success: false, 
        error: "Please add a meaningful description to your deck before using AI generation. The description helps the AI create relevant flashcards.",
        requiresDescription: true
      };
    }

    // Generate cards using AI
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'), // gpt-4o-mini supports structured outputs and is cost-effective
      schema: z.object({
        cards: z.array(
          z.object({
            front: z.string().min(1).max(500).describe('The question or term on the front of the flashcard'),
            back: z.string().min(1).max(1000).describe('The answer or definition on the back of the flashcard'),
          })
        ).min(15).max(25), // Be flexible: accept 15-25 cards instead of exactly 20
      }),
      prompt: `Generate 20 educational flashcards about "${validated.deckName}"${
        validated.deckDescription ? `. Additional context: ${validated.deckDescription}` : ''
      }.

Each flashcard should have:
- front: A clear, concise question or term (max 500 characters)
- back: A comprehensive answer or definition (max 1000 characters)

Make the content educational, accurate, and appropriate for the topic. Vary the difficulty and style of questions.`,
    });
    
    // Validate we got a reasonable number of cards
    if (object.cards.length < 15) {
      throw new Error(`Only generated ${object.cards.length} cards, expected at least 15`);
    }

    // Insert generated cards into database
    const insertedCards = [];
    for (const card of object.cards) {
      const insertedCard = await createCard({
        deckId: validated.deckId,
        front: card.front,
        back: card.back,
      });
      insertedCards.push(insertedCard);
    }

    revalidatePath(`/decks/${validated.deckId}`);
    revalidatePath('/dashboard');

    return { success: true, data: { count: insertedCards.length } };
  } catch (error) {
    console.error('AI generation error (full details):', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    
    // Return more specific error messages
    if (error instanceof Error) {
      // Check for common OpenAI API errors
      if (error.message.includes('API key')) {
        return { success: false, error: "OpenAI API key is invalid or missing" };
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return { success: false, error: "OpenAI quota exceeded or billing issue" };
      }
      if (error.message.includes('rate limit')) {
        return { success: false, error: "Rate limit exceeded. Please try again in a moment" };
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        return { success: false, error: "Network error. Please check your internet connection" };
      }
      
      // Return the actual error message for debugging
      return { success: false, error: `AI generation failed: ${error.message}` };
    }
    
    return { success: false, error: "Failed to generate cards with AI" };
  }
}

