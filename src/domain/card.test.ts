import { describe, it, expect } from 'vitest';
import { CardSchema, type Card, type Suit, type Rank } from './card.js';

describe('Card Schema', () => {
  it('should validate a card with valid suit and rank', () => {
    const card = {
      suit: 'hearts' as Suit,
      rank: 'A' as Rank,
    };

    const result = CardSchema.safeParse(card);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.suit).toBe('hearts');
      expect(result.data.rank).toBe('A');
    }
  });

  it('should validate all valid suits', () => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

    suits.forEach((suit) => {
      const card = { suit, rank: 'A' as Rank };
      const result = CardSchema.safeParse(card);
      expect(result.success).toBe(true);
    });
  });

  it('should validate all valid ranks', () => {
    const ranks: Rank[] = [
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

    ranks.forEach((rank) => {
      const card = { suit: 'hearts' as Suit, rank };
      const result = CardSchema.safeParse(card);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid suit', () => {
    const invalidCard = {
      suit: 'invalid',
      rank: 'A',
    };

    const result = CardSchema.safeParse(invalidCard);

    expect(result.success).toBe(false);
  });

  it('should reject invalid rank', () => {
    const invalidCard = {
      suit: 'hearts',
      rank: '1',
    };

    const result = CardSchema.safeParse(invalidCard);

    expect(result.success).toBe(false);
  });
});
