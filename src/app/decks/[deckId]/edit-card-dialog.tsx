'use client';

import { useState } from 'react';
import { updateCardAction, type UpdateCardInput } from '@/app/actions/cards';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type EditCardDialogProps = {
  cardId: number;
  deckId: number;
  currentFront: string;
  currentBack: string;
};

export function EditCardDialog({ cardId, deckId, currentFront, currentBack }: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(currentFront);
  const [back, setBack] = useState(currentBack);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const input: UpdateCardInput = {
      cardId,
      deckId,
      front,
      back,
    };

    const result = await updateCardAction(input);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || 'Failed to update card');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the front and back sides of this flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front Side</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the question or term"
              required
              rows={3}
              maxLength={1000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Back Side</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the answer or definition"
              required
              rows={3}
              maxLength={1000}
            />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

