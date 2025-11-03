import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignIn, SignUp } from "@clerk/nextjs";

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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg">Sign In</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="sr-only">Sign In</DialogTitle>
              <SignIn routing="hash" />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">Sign Up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="sr-only">Sign Up</DialogTitle>
              <SignUp routing="hash" />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
