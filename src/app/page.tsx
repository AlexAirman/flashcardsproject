import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            FlashCards
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Learn anything from anywhere
          </p>
        </div>
        <div className="flex gap-4">
          <Button size="lg">Sign In</Button>
          <Button size="lg" variant="outline">Sign Up</Button>
        </div>
      </main>
    </div>
  );
}
