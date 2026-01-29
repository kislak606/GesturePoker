import type { Card, Rank } from './card.js';

export type HandRanking =
  | 'royal-flush'
  | 'straight-flush'
  | 'four-of-a-kind'
  | 'full-house'
  | 'flush'
  | 'straight'
  | 'three-of-a-kind'
  | 'two-pair'
  | 'pair'
  | 'high-card';

export type HandEvaluation = {
  readonly ranking: HandRanking;
  readonly value: number;
  readonly tiebreakers: readonly number[];
};

const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

const RANKING_VALUES: Record<HandRanking, number> = {
  'high-card': 1,
  'pair': 2,
  'two-pair': 3,
  'three-of-a-kind': 4,
  'straight': 5,
  'flush': 6,
  'full-house': 7,
  'four-of-a-kind': 8,
  'straight-flush': 9,
  'royal-flush': 10,
};

const getRankValue = (rank: Rank): number => {
  return RANK_VALUES[rank];
};

const isFlush = (hand: readonly Card[]): boolean => {
  const firstSuit = hand[0].suit;
  return hand.every((card) => card.suit === firstSuit);
};

const isStraight = (sortedValues: readonly number[]): boolean => {
  // Check for ace-low straight (A-2-3-4-5)
  const isAceLowStraight =
    sortedValues[0] === 2 &&
    sortedValues[1] === 3 &&
    sortedValues[2] === 4 &&
    sortedValues[3] === 5 &&
    sortedValues[4] === 14;

  if (isAceLowStraight) {
    return true;
  }

  // Check for regular straight
  for (let i = 1; i < sortedValues.length; i++) {
    if (sortedValues[i] !== sortedValues[i - 1] + 1) {
      return false;
    }
  }

  return true;
};

const getCardCounts = (
  hand: readonly Card[]
): Map<number, readonly number[]> => {
  const rankCounts = new Map<number, number>();

  for (const card of hand) {
    const value = getRankValue(card.rank);
    rankCounts.set(value, (rankCounts.get(value) || 0) + 1);
  }

  // Group ranks by their count
  const countGroups = new Map<number, number[]>();

  for (const [rank, count] of rankCounts.entries()) {
    const group = countGroups.get(count) || [];
    group.push(rank);
    countGroups.set(count, group);
  }

  // Sort each group in descending order
  const sortedGroups = new Map<number, readonly number[]>();
  for (const [count, ranks] of countGroups.entries()) {
    sortedGroups.set(count, [...ranks].sort((a, b) => b - a));
  }

  return sortedGroups;
};

export const evaluateHand = (hand: readonly Card[]): HandEvaluation => {
  if (hand.length !== 5) {
    throw new Error(`Hand must contain exactly 5 cards, got ${hand.length}`);
  }

  const values = hand.map((card) => getRankValue(card.rank));
  const sortedValues = [...values].sort((a, b) => a - b);
  const cardCounts = getCardCounts(hand);

  const flush = isFlush(hand);
  const straight = isStraight(sortedValues);

  // Royal Flush: A-K-Q-J-10 all same suit
  if (flush && straight && sortedValues[4] === 14 && sortedValues[0] === 10) {
    return {
      ranking: 'royal-flush',
      value: RANKING_VALUES['royal-flush'],
      tiebreakers: [],
    };
  }

  // Straight Flush
  if (flush && straight) {
    // For ace-low straight, high card is 5 (not ace)
    const highCard =
      sortedValues[4] === 14 && sortedValues[0] === 2 ? 5 : sortedValues[4];
    return {
      ranking: 'straight-flush',
      value: RANKING_VALUES['straight-flush'],
      tiebreakers: [highCard],
    };
  }

  // Four of a Kind
  if (cardCounts.has(4)) {
    const fourKind = cardCounts.get(4)![0];
    const kicker = cardCounts.get(1)![0];
    return {
      ranking: 'four-of-a-kind',
      value: RANKING_VALUES['four-of-a-kind'],
      tiebreakers: [fourKind, kicker],
    };
  }

  // Full House
  if (cardCounts.has(3) && cardCounts.has(2)) {
    const threeKind = cardCounts.get(3)![0];
    const pair = cardCounts.get(2)![0];
    return {
      ranking: 'full-house',
      value: RANKING_VALUES['full-house'],
      tiebreakers: [threeKind, pair],
    };
  }

  // Flush
  if (flush) {
    const tiebreakers = [...sortedValues].reverse();
    return {
      ranking: 'flush',
      value: RANKING_VALUES['flush'],
      tiebreakers,
    };
  }

  // Straight
  if (straight) {
    // For ace-low straight, high card is 5 (not ace)
    const highCard =
      sortedValues[4] === 14 && sortedValues[0] === 2 ? 5 : sortedValues[4];
    return {
      ranking: 'straight',
      value: RANKING_VALUES['straight'],
      tiebreakers: [highCard],
    };
  }

  // Three of a Kind
  if (cardCounts.has(3)) {
    const threeKind = cardCounts.get(3)![0];
    const kickers = [...cardCounts.get(1)!].sort((a: number, b: number) => b - a);
    return {
      ranking: 'three-of-a-kind',
      value: RANKING_VALUES['three-of-a-kind'],
      tiebreakers: [threeKind, ...kickers],
    };
  }

  // Two Pair
  if (cardCounts.has(2) && cardCounts.get(2)!.length === 2) {
    const pairs = [...cardCounts.get(2)!].sort((a: number, b: number) => b - a);
    const kicker = cardCounts.get(1)![0];
    return {
      ranking: 'two-pair',
      value: RANKING_VALUES['two-pair'],
      tiebreakers: [...pairs, kicker],
    };
  }

  // One Pair
  if (cardCounts.has(2)) {
    const pair = cardCounts.get(2)![0];
    const kickers = [...cardCounts.get(1)!].sort((a: number, b: number) => b - a);
    return {
      ranking: 'pair',
      value: RANKING_VALUES['pair'],
      tiebreakers: [pair, ...kickers],
    };
  }

  // High Card
  const tiebreakers = [...sortedValues].reverse();
  return {
    ranking: 'high-card',
    value: RANKING_VALUES['high-card'],
    tiebreakers,
  };
};

export const compareHands = (
  hand1: readonly Card[],
  hand2: readonly Card[]
): number => {
  const eval1 = evaluateHand(hand1);
  const eval2 = evaluateHand(hand2);

  // Compare by ranking value
  if (eval1.value !== eval2.value) {
    return eval1.value - eval2.value;
  }

  // Compare tiebreakers
  for (let i = 0; i < eval1.tiebreakers.length; i++) {
    const diff = eval1.tiebreakers[i] - eval2.tiebreakers[i];
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
};
