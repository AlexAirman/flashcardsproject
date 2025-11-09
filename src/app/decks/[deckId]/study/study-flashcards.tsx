"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

type DeckType = {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CardType = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudyFlashcardsProps = {
  deck: DeckType;
  cards: CardType[];
};

export function StudyFlashcards({ deck, cards }: StudyFlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [answers, setAnswers] = useState<Map<number, boolean>>(new Map());

  // Shuffle cards based on shuffle mode
  const studyCards = useMemo(() => {
    if (!isShuffled) return cards;
    
    // Use shuffle seed to create deterministic shuffle for this session
    const shuffled = [...cards];
    // Simple seeded shuffle using shuffleSeed
    const seed = shuffleSeed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Create pseudo-random number based on seed and index
      const j = Math.abs((seed * (i + 1) * 9301 + 49297) % 233280) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [cards, isShuffled, shuffleSeed]);

  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex + 1) / studyCards.length) * 100;
  const isLastCard = currentIndex === studyCards.length - 1;
  const currentCardAnswer = answers.get(currentCard.id);
  
  // Calculate score
  const correctAnswers = Array.from(answers.values()).filter(answer => answer).length;
  const totalAnswered = answers.size;
  const scorePercentage = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers(new Map());
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setShuffleSeed(Date.now()); // Generate new seed for shuffle
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers(new Map());
  };

  const handleMarkCorrect = () => {
    setAnswers(new Map(answers.set(currentCard.id, true)));
    if (!isLastCard) {
      handleNext();
    } else {
      setIsFlipped(false);
    }
  };

  const handleMarkIncorrect = () => {
    setAnswers(new Map(answers.set(currentCard.id, false)));
    if (!isLastCard) {
      handleNext();
    } else {
      setIsFlipped(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ": // Space
        case "Enter":
          event.preventDefault();
          handleFlip();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, isFlipped]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-3xl mx-auto">
      {/* Deck Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
        {deck.description && (
          <p className="text-muted-foreground">{deck.description}</p>
        )}
      </div>

      {/* Score Display */}
      {totalAnswered > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Current Score</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {correctAnswers} / {totalAnswered}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground mb-1">Accuracy</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {scorePercentage}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {studyCards.length}
        </div>
        <Button
          variant={isShuffled ? "default" : "outline"}
          size="sm"
          onClick={handleShuffle}
        >
          {isShuffled ? "Shuffled" : "Shuffle"}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card className={`mb-8 min-h-[400px] flex flex-col justify-center cursor-pointer hover:shadow-lg transition-all ${
        currentCardAnswer !== undefined
          ? currentCardAnswer
            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
            : "border-red-500 bg-red-50 dark:bg-red-950/20"
          : ""
      }`}
        onClick={handleFlip}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-center text-muted-foreground text-sm uppercase tracking-wide flex-1">
              {isFlipped ? "Back" : "Front"}
            </CardTitle>
            {currentCardAnswer !== undefined && (
              <div className="text-sm font-semibold">
                {currentCardAnswer ? (
                  <span className="text-green-600 dark:text-green-400">✓ Correct</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ Incorrect</span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-2xl font-medium whitespace-pre-wrap">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>
        </CardContent>
        <CardContent className="pt-0 pb-6 text-center">
          <p className="text-sm text-muted-foreground">
            Click card to flip
          </p>
        </CardContent>
      </Card>

      {/* Answer Buttons (shown when flipped) */}
      {isFlipped && (
        <div className="flex gap-4 justify-center mb-6">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 max-w-[200px] border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
            onClick={handleMarkIncorrect}
          >
            ✗ Incorrect
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 max-w-[200px] border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950"
            onClick={handleMarkCorrect}
          >
            ✓ Correct
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-center mb-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={handleFlip}
        >
          Flip Card
        </Button>

        {!isLastCard ? (
          <Button
            onClick={handleNext}
          >
            Next →
          </Button>
        ) : (
          <Button
            onClick={handleRestart}
            variant="default"
          >
            Restart
          </Button>
        )}
      </div>

      {/* Completion Message */}
      {isLastCard && currentCardAnswer !== undefined && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-400">
              🎉 Study Session Complete!
            </h3>
            <p className="text-muted-foreground mb-4">
              You&apos;ve completed all {studyCards.length} cards in this deck!
            </p>
            
            {/* Final Score */}
            <div className="my-6 p-6 bg-white dark:bg-gray-900 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-2">Final Score</div>
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                {scorePercentage}%
              </div>
              <div className="text-lg text-muted-foreground">
                {correctAnswers} correct out of {totalAnswered} cards
              </div>
              
              {/* Performance message */}
              <div className="mt-4 text-sm">
                {scorePercentage === 100 && (
                  <p className="text-green-600 dark:text-green-400 font-semibold">Perfect score! Outstanding! 🌟</p>
                )}
                {scorePercentage >= 80 && scorePercentage < 100 && (
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">Great job! Keep it up! 👏</p>
                )}
                {scorePercentage >= 60 && scorePercentage < 80 && (
                  <p className="text-yellow-600 dark:text-yellow-400 font-semibold">Good effort! Practice makes perfect! 💪</p>
                )}
                {scorePercentage < 60 && (
                  <p className="text-orange-600 dark:text-orange-400 font-semibold">Keep practicing! You&apos;ll get there! 📚</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart} variant="outline">
                Study Again
              </Button>
              <Link href={`/decks/${deck.id}`}>
                <Button>Back to Deck</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Shortcuts Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-1">
            <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>, <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>, or <kbd className="px-2 py-1 bg-muted rounded text-xs">Click</kbd> - Flip card</li>
            <li><kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd> - Previous card</li>
            <li><kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> - Next card</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

