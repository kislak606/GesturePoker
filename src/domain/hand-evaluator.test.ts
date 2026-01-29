import { describe, it, expect } from 'vitest';
import { evaluateHand, compareHands, type HandRanking } from './hand-evaluator.js';
import type { Card } from './card.js';

const createCard = (rank: Card['rank'], suit: Card['suit']): Card => ({
  rank,
  suit,
});

describe('Hand Evaluator', () => {
  describe('evaluateHand', () => {
    it('should recognize Royal Flush', () => {
      const hand: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('royal-flush');
    });

    it('should recognize Straight Flush', () => {
      const hand: readonly Card[] = [
        createCard('9', 'spades'),
        createCard('8', 'spades'),
        createCard('7', 'spades'),
        createCard('6', 'spades'),
        createCard('5', 'spades'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('straight-flush');
    });

    it('should recognize Four of a Kind', () => {
      const hand: readonly Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
        createCard('2', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('four-of-a-kind');
    });

    it('should recognize Full House', () => {
      const hand: readonly Card[] = [
        createCard('Q', 'hearts'),
        createCard('Q', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('5', 'spades'),
        createCard('5', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('full-house');
    });

    it('should recognize Flush', () => {
      const hand: readonly Card[] = [
        createCard('K', 'diamonds'),
        createCard('J', 'diamonds'),
        createCard('9', 'diamonds'),
        createCard('6', 'diamonds'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('flush');
    });

    it('should recognize Straight', () => {
      const hand: readonly Card[] = [
        createCard('9', 'hearts'),
        createCard('8', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('6', 'spades'),
        createCard('5', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('straight');
    });

    it('should recognize Ace-low Straight (wheel)', () => {
      const hand: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('3', 'clubs'),
        createCard('4', 'spades'),
        createCard('5', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('straight');
    });

    it('should recognize Three of a Kind', () => {
      const hand: readonly Card[] = [
        createCard('7', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('K', 'spades'),
        createCard('2', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('three-of-a-kind');
    });

    it('should recognize Two Pair', () => {
      const hand: readonly Card[] = [
        createCard('J', 'hearts'),
        createCard('J', 'diamonds'),
        createCard('3', 'clubs'),
        createCard('3', 'spades'),
        createCard('2', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('two-pair');
    });

    it('should recognize One Pair', () => {
      const hand: readonly Card[] = [
        createCard('10', 'hearts'),
        createCard('10', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('5', 'spades'),
        createCard('2', 'hearts'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('pair');
    });

    it('should recognize High Card', () => {
      const hand: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'hearts'),
        createCard('9', 'spades'),
      ];

      const result = evaluateHand(hand);

      expect(result.ranking).toBe('high-card');
    });

    it('should throw error for hand with less than 5 cards', () => {
      const hand: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
      ];

      expect(() => evaluateHand(hand)).toThrow();
    });

    it('should throw error for hand with more than 5 cards', () => {
      const hand: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'hearts'),
        createCard('10', 'spades'),
        createCard('9', 'hearts'),
      ];

      expect(() => evaluateHand(hand)).toThrow();
    });
  });

  describe('compareHands', () => {
    it('should rank Royal Flush higher than Straight Flush', () => {
      const royalFlush: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
      ];

      const straightFlush: readonly Card[] = [
        createCard('9', 'spades'),
        createCard('8', 'spades'),
        createCard('7', 'spades'),
        createCard('6', 'spades'),
        createCard('5', 'spades'),
      ];

      const result = compareHands(royalFlush, straightFlush);

      expect(result).toBeGreaterThan(0);
    });

    it('should rank Four of a Kind higher than Full House', () => {
      const fourOfAKind: readonly Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
        createCard('2', 'hearts'),
      ];

      const fullHouse: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('Q', 'spades'),
        createCard('Q', 'hearts'),
      ];

      const result = compareHands(fourOfAKind, fullHouse);

      expect(result).toBeGreaterThan(0);
    });

    it('should rank higher straight over lower straight', () => {
      const highStraight: readonly Card[] = [
        createCard('9', 'hearts'),
        createCard('8', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('6', 'spades'),
        createCard('5', 'hearts'),
      ];

      const lowStraight: readonly Card[] = [
        createCard('6', 'hearts'),
        createCard('5', 'diamonds'),
        createCard('4', 'clubs'),
        createCard('3', 'spades'),
        createCard('2', 'hearts'),
      ];

      const result = compareHands(highStraight, lowStraight);

      expect(result).toBeGreaterThan(0);
    });

    it('should rank higher pair over lower pair', () => {
      const highPair: readonly Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('4', 'spades'),
        createCard('2', 'hearts'),
      ];

      const lowPair: readonly Card[] = [
        createCard('3', 'hearts'),
        createCard('3', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
      ];

      const result = compareHands(highPair, lowPair);

      expect(result).toBeGreaterThan(0);
    });

    it('should use kicker when pairs are equal', () => {
      const pairWithAceKicker: readonly Card[] = [
        createCard('5', 'hearts'),
        createCard('5', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
      ];

      const pairWithKingKicker: readonly Card[] = [
        createCard('5', 'clubs'),
        createCard('5', 'spades'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
        createCard('J', 'clubs'),
      ];

      const result = compareHands(pairWithAceKicker, pairWithKingKicker);

      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for identical hands', () => {
      const hand1: readonly Card[] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('9', 'hearts'),
      ];

      const hand2: readonly Card[] = [
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds'),
        createCard('9', 'clubs'),
      ];

      const result = compareHands(hand1, hand2);

      expect(result).toBe(0);
    });

    it('should return negative when second hand wins', () => {
      const lowPair: readonly Card[] = [
        createCard('3', 'hearts'),
        createCard('3', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
      ];

      const highPair: readonly Card[] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('4', 'spades'),
        createCard('2', 'hearts'),
      ];

      const result = compareHands(lowPair, highPair);

      expect(result).toBeLessThan(0);
    });
  });
});
