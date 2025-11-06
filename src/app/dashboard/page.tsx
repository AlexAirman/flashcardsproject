import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDecksByUserId } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { CreateDeckDialog } from "./create-deck-dialog";

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Check user's plan features
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const isFreePlan = !hasUnlimitedDecks;

  // Fetch user's decks
  const decks = await getDecksByUserId(userId);
  
  // Get card counts for each deck
  const decksWithCardCounts = await Promise.all(
    decks.map(async (deck) => {
      const cards = await getCardsByDeckId(deck.id);
      return {
        ...deck,
        cardCount: cards.length,
      };
    })
  );

  // Calculate total cards
  const totalCards = decksWithCardCounts.reduce((sum, deck) => sum + deck.cardCount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage your flashcards and track your progress
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Decks</CardTitle>
              <CardDescription>Your flashcard collections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-black dark:text-zinc-50">
                {decks.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Cards</CardTitle>
              <CardDescription>Across all decks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-black dark:text-zinc-50">
                {totalCards}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ready to Study</CardTitle>
              <CardDescription>Start learning now</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                Begin Study Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Decks Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
              My Decks
              {isFreePlan && (
                <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                  ({decks.length}/3)
                </span>
              )}
            </h2>
            {isFreePlan && decks.length >= 3 ? (
              <div className="flex items-center gap-2">
                <Link href="/pricing">
                  <Button>
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            ) : (
              <CreateDeckDialog />
            )}
          </div>
          
          {/* Upgrade banner for users at deck limit */}
          {isFreePlan && decks.length >= 3 && (
            <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">
                      You've reached your deck limit
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Upgrade to Pro to create unlimited decks and unlock AI-powered flashcard generation!
                    </p>
                    <Link href="/pricing">
                      <Button size="sm">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {decksWithCardCounts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-zinc-600 dark:text-zinc-400">
                  No decks yet. Create your first deck to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {decksWithCardCounts.map((deck) => (
                <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <Link 
                        href={`/decks/${deck.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {deck.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {deck.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Cards
                        </span>
                        <span className="font-semibold text-lg text-black dark:text-zinc-50">
                          {deck.cardCount}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {deck.cardCount > 0 ? (
                          <Link href={`/decks/${deck.id}/study`} className="flex-1">
                            <Button className="w-full" size="sm">
                              Study
                            </Button>
                          </Link>
                        ) : (
                          <Button className="flex-1" size="sm" disabled>
                            Study
                          </Button>
                        )}
                        <Link href={`/decks/${deck.id}`} className="flex-1">
                          <Button className="w-full" variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

