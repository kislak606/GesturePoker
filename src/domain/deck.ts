import type { Card, Suit, Rank } from './card.js';

const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: readonly Rank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];

export const createDeck = (): readonly Card[] => {
  const cards: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank });
    }
  }

  return cards;
};

export const shuffleDeck = (deck: readonly Card[]): readonly Card[] => {
  const shuffled = [...deck];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
};

export type DealResult = {
  readonly cards: readonly Card[];
  readonly remainingDeck: readonly Card[];
};

export const dealCards = (
  deck: readonly Card[],
  count: number
): DealResult => {
  if (count > deck.length) {
    throw new Error(
      `Cannot deal ${count} cards from deck with ${deck.length} cards`
    );
  }

  if (deck.length === 0 && count > 0) {
    throw new Error('Cannot deal from empty deck');
  }

  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);

  return {
    cards,
    remainingDeck,
  };
};
