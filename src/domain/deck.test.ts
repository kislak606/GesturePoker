import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCards } from './deck.js';
import type { Card } from './card.js';

describe('Deck', () => {
  describe('createDeck', () => {
    it('should create a standard 52-card deck', () => {
      const deck = createDeck();

      expect(deck.length).toBe(52);
    });

    it('should contain all 13 ranks', () => {
      const deck = createDeck();
      const ranks = deck.map((card) => card.rank);
      const uniqueRanks = new Set(ranks);

      expect(uniqueRanks.size).toBe(13);
      expect(uniqueRanks.has('2')).toBe(true);
      expect(uniqueRanks.has('A')).toBe(true);
    });

    it('should contain all 4 suits', () => {
      const deck = createDeck();
      const suits = deck.map((card) => card.suit);
      const uniqueSuits = new Set(suits);

      expect(uniqueSuits.size).toBe(4);
      expect(uniqueSuits.has('hearts')).toBe(true);
      expect(uniqueSuits.has('diamonds')).toBe(true);
      expect(uniqueSuits.has('clubs')).toBe(true);
      expect(uniqueSuits.has('spades')).toBe(true);
    });

    it('should contain exactly 4 cards of each rank', () => {
      const deck = createDeck();
      const ranks = deck.map((card) => card.rank);

      const rankCounts = ranks.reduce(
        (acc, rank) => {
          acc[rank] = (acc[rank] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      Object.values(rankCounts).forEach((count) => {
        expect(count).toBe(4);
      });
    });

    it('should contain exactly 13 cards of each suit', () => {
      const deck = createDeck();
      const suits = deck.map((card) => card.suit);

      const suitCounts = suits.reduce(
        (acc, suit) => {
          acc[suit] = (acc[suit] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      Object.values(suitCounts).forEach((count) => {
        expect(count).toBe(13);
      });
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with same number of cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      expect(shuffled.length).toBe(52);
    });

    it('should not mutate the original deck', () => {
      const deck = createDeck();
      const originalFirstCard = deck[0];
      const shuffled = shuffleDeck(deck);

      expect(deck[0]).toBe(originalFirstCard);
      expect(deck.length).toBe(52);
    });

    it('should contain all the same cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      const deckString = deck
        .map((c) => `${c.rank}${c.suit}`)
        .sort()
        .join(',');
      const shuffledString = shuffled
        .map((c) => `${c.rank}${c.suit}`)
        .sort()
        .join(',');

      expect(shuffledString).toBe(deckString);
    });

    it('should produce different order than original deck', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      const sameOrder = deck.every(
        (card, index) =>
          card.rank === shuffled[index].rank &&
          card.suit === shuffled[index].suit
      );

      // With 52! possible permutations, probability of same order is negligible
      expect(sameOrder).toBe(false);
    });
  });

  describe('dealCards', () => {
    it('should deal requested number of cards from deck', () => {
      const deck = createDeck();
      const dealt = dealCards(deck, 2);

      expect(dealt.cards.length).toBe(2);
    });

    it('should return remaining deck without dealt cards', () => {
      const deck = createDeck();
      const result = dealCards(deck, 5);

      expect(result.remainingDeck.length).toBe(47);
    });

    it('should not mutate the original deck', () => {
      const deck = createDeck();
      const originalLength = deck.length;
      const result = dealCards(deck, 3);

      expect(deck.length).toBe(originalLength);
    });

    it('should deal cards from the top of the deck', () => {
      const deck = createDeck();
      const firstCard = deck[0];
      const secondCard = deck[1];

      const result = dealCards(deck, 2);

      expect(result.cards[0]).toEqual(firstCard);
      expect(result.cards[1]).toEqual(secondCard);
    });

    it('should handle dealing all cards', () => {
      const deck = createDeck();
      const result = dealCards(deck, 52);

      expect(result.cards.length).toBe(52);
      expect(result.remainingDeck.length).toBe(0);
    });

    it('should throw error when trying to deal more cards than available', () => {
      const deck = createDeck();

      expect(() => dealCards(deck, 53)).toThrow();
    });

    it('should throw error when trying to deal from empty deck', () => {
      const emptyDeck: Card[] = [];

      expect(() => dealCards(emptyDeck, 1)).toThrow();
    });
  });
});
