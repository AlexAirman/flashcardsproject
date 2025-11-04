import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDeckByIdForUser } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditDeckDialog } from "./edit-deck-dialog";
import { AddCardDialog } from "./add-card-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { DeleteCardDialog } from "./delete-card-dialog";

type Props = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function DeckPage({ params }: Props) {
  // Get authenticated user
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view this deck.</CardDescription>
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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Deck Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl">{deck.name}</CardTitle>
              {deck.description && (
                <CardDescription className="text-lg mt-2">
                  {deck.description}
                </CardDescription>
              )}
              <CardDescription className="mt-4">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'} in this deck
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {cards.length > 0 && (
                <Link href={`/decks/${deckIdNum}/study`}>
                  <Button variant="default">Study Cards</Button>
                </Link>
              )}
              <EditDeckDialog 
                deckId={deckIdNum}
                currentName={deck.name}
                currentDescription={deck.description}
              />
              <AddCardDialog deckId={deckIdNum} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No cards in this deck yet. Click "Add Card" to create your first flashcard!
            </CardContent>
          </Card>
        ) : (
          cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Front</CardTitle>
                  <div className="flex gap-2">
                    <EditCardDialog
                      cardId={card.id}
                      deckId={deckIdNum}
                      currentFront={card.front}
                      currentBack={card.back}
                    />
                    <DeleteCardDialog
                      cardId={card.id}
                      deckId={deckIdNum}
                    />
                  </div>
                </div>
                <CardDescription className="text-base text-foreground mt-2">
                  {card.front}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Back</p>
                  <p className="text-base">{card.back}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

