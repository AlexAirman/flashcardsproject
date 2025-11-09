'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDeckAction, type DeleteDeckInput } from '@/app/actions/decks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type DeleteDeckDialogProps = {
  deckId: number;
  deckName: string;
  cardCount: number;
};

export function DeleteDeckDialog({ deckId, deckName, cardCount }: DeleteDeckDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsSubmitting(true);

    const input: DeleteDeckInput = {
      deckId,
    };

    const result = await deleteDeckAction(input);

    if (result.success) {
      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
    } else {
      setError(result.error || 'Failed to delete deck');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" suppressHydrationWarning>Delete Deck</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Deck</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the deck &quot;{deckName}&quot;?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            <p className="font-semibold">Warning: This action cannot be undone.</p>
            <p className="mt-2">
              This will permanently delete the deck and all {cardCount} {cardCount === 1 ? 'card' : 'cards'} associated with it.
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Deck'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

