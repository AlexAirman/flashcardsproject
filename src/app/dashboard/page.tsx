import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>My Decks</CardTitle>
              <CardDescription>
                View and manage your flashcard decks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  No decks yet. Create your first deck to get started!
                </p>
                <Button>Create New Deck</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Session</CardTitle>
              <CardDescription>
                Start learning with your flashcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Ready to practice? Start a study session now!
                </p>
                <Button variant="outline">Start Studying</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Track your learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Cards studied
                    </span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Total decks
                    </span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Study streak
                    </span>
                    <span className="font-semibold">0 days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest flashcard activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No recent activity. Start studying to see your progress here!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

