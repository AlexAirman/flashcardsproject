import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDeckByIdForUser } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyFlashcards } from "./study-flashcards";

type Props = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function StudyPage({ params }: Props) {
  // Get authenticated user
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to study this deck.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get deck ID from params
  const { deckId } = await params;
  const deckIdNum = parseInt(deckId, 10);
  
  if (isNaN(deckIdNum)) {
    notFound();
  }

  // Fetch deck with ownership verification
  const deck = await getDeckByIdForUser(deckIdNum, userId);
  
  if (!deck) {
    notFound();
  }

  // Fetch cards for this deck
  const cards = await getCardsByDeckId(deckIdNum);

  // If no cards, show message
  if (cards.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href={`/decks/${deckId}`}>
            <Button variant="outline">← Back to Deck</Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{deck.name}</CardTitle>
            <CardDescription>No cards to study yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This deck doesn&apos;t have any cards yet. Add some cards to start studying!
            </p>
            <Link href={`/decks/${deckId}`}>
              <Button>Go to Deck</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/decks/${deckId}`}>
          <Button variant="outline">← Back to Deck</Button>
        </Link>
      </div>

      {/* Study Interface */}
      <StudyFlashcards 
        deck={deck}
        cards={cards}
      />
    </div>
  );
}

