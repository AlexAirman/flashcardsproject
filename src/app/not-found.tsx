import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-black dark:text-zinc-50 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-black dark:text-zinc-50 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been created yet.
        </p>
        <Link href="/dashboard">
          <Button size="lg">
            Go Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

