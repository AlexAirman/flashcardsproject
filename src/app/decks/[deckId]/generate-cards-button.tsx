'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateCardsWithAIAction } from "@/app/actions/cards";
import { toast } from "sonner";

type GenerateCardsButtonProps = {
  deckId: number;
  deckName: string;
  deckDescription: string | null;
  hasAIFeature: boolean;
};

export function GenerateCardsButton({ 
  deckId, 
  deckName, 
  deckDescription, 
  hasAIFeature 
}: GenerateCardsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    // If user doesn't have AI feature, navigate to pricing page
    if (!hasAIFeature) {
      router.push('/pricing');
      return;
    }

    // Check if description is missing or too short
    if (!deckDescription || deckDescription.trim().length < 10) {
      toast.error("Please add a meaningful description to your deck first", {
        description: "Click 'Edit Deck' to add a description. The AI uses it to generate relevant flashcards.",
        duration: 5000,
      });
      return;
    }

    // Otherwise, generate cards with AI
    setIsGenerating(true);
    try {
      const result = await generateCardsWithAIAction({
        deckId,
        deckName,
        deckDescription: deckDescription || undefined,
      });

      if (result.success) {
        toast.success(`Successfully generated ${result.data?.count || 20} cards with AI!`);
      } else {
        // Check if it's a description error
        if ('requiresDescription' in result && result.requiresDescription) {
          toast.error("Description Required", {
            description: "Please add a meaningful description to your deck before using AI generation.",
            duration: 5000,
          });
        } else {
          toast.error(result.error || "Failed to generate cards");
        }
      }
    } catch {
      toast.error("An error occurred while generating cards");
    } finally {
      setIsGenerating(false);
    }
  };

  const needsDescription = !deckDescription || deckDescription.trim().length < 10;

  // For free users, wrap button in tooltip
  if (!hasAIFeature) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="default" 
              onClick={handleClick}
              disabled={isGenerating}
              suppressHydrationWarning
            >
              ✨ Generate Cards with AI
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a Pro feature. Click to view pricing.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For pro users without description, show with tooltip
  if (needsDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              onClick={handleClick}
              disabled={isGenerating}
              suppressHydrationWarning
            >
              ✨ Generate Cards with AI
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a deck description first to use AI generation.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For pro users with description, show active button
  return (
    <Button 
      variant="default" 
      onClick={handleClick}
      disabled={isGenerating}
    >
      {isGenerating ? "Generating..." : "✨ Generate Cards with AI"}
    </Button>
  );
}

