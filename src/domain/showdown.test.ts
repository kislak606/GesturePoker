import { describe, it, expect } from 'vitest';
import { evaluateShowdown, distributePot } from './showdown.js';
import { createGame, createPlayer } from './game.js';
import type { Card } from './card.js';
import type { GameState } from './game.js';

const createTestCard = (rank: Card['rank'], suit: Card['suit']): Card => ({
  rank,
  suit,
});

const createGameStateWithHands = (options: {
  player0Hand: readonly Card[];
  player1Hand: readonly Card[];
  player2Hand: readonly Card[];
  communityCards: readonly Card[];
  pot: number;
}): GameState => {
  const baseGame = createGame();

  return {
    ...baseGame,
    players: [
      { ...baseGame.players[0], hand: options.player0Hand, status: 'active' },
      { ...baseGame.players[1], hand: options.player1Hand, status: 'active' },
      { ...baseGame.players[2], hand: options.player2Hand, status: 'active' },
    ],
    communityCards: options.communityCards,
    pot: options.pot,
    phase: 'showdown',
  };
};

describe('evaluateShowdown', () => {
  it('should identify single winner with best hand', () => {
    const gameState = createGameStateWithHands({
      player0Hand: [createTestCard('A', 'hearts'), createTestCard('K', 'hearts')],
      player1Hand: [createTestCard('2', 'clubs'), createTestCard('3', 'clubs')],
      player2Hand: [createTestCard('7', 'diamonds'), createTestCard('8', 'diamonds')],
      communityCards: [
        createTestCard('Q', 'hearts'),
        createTestCard('J', 'hearts'),
        createTestCard('10', 'hearts'),
        createTestCard('9', 'spades'),
        createTestCard('4', 'spades'),
      ],
      pot: 300,
    });

    const result = evaluateShowdown(gameState);

    expect(result.winners.length).toBe(1);
    expect(result.winners[0].playerIndex).toBe(0);
    expect(result.winners[0].evaluation.ranking).toBe('royal-flush');
    expect(result.potPerWinner).toBe(300);
  });

  it('should identify multiple winners on tie', () => {
    const gameState = createGameStateWithHands({
      player0Hand: [createTestCard('A', 'hearts'), createTestCard('K', 'spades')],
      player1Hand: [createTestCard('A', 'clubs'), createTestCard('K', 'diamonds')],
      player2Hand: [createTestCard('2', 'diamonds'), createTestCard('3', 'diamonds')],
      communityCards: [
        createTestCard('Q', 'hearts'),
        createTestCard('J', 'hearts'),
        createTestCard('10', 'hearts'),
        createTestCard('9', 'spades'),
        createTestCard('8', 'spades'),
      ],
      pot: 300,
    });

    const result = evaluateShowdown(gameState);

    expect(result.winners.length).toBe(2);
    expect(result.winners[0].playerIndex).toBe(0);
    expect(result.winners[1].playerIndex).toBe(1);
    expect(result.potPerWinner).toBe(150);
  });

  it('should exclude folded players from showdown', () => {
    const baseGame = createGame();
    const gameState: GameState = {
      ...baseGame,
      players: [
        {
          ...baseGame.players[0],
          hand: [createTestCard('A', 'hearts'), createTestCard('K', 'hearts')],
          status: 'folded',
        },
        {
          ...baseGame.players[1],
          hand: [createTestCard('2', 'clubs'), createTestCard('3', 'clubs')],
          status: 'active',
        },
        {
          ...baseGame.players[2],
          hand: [createTestCard('7', 'diamonds'), createTestCard('8', 'diamonds')],
          status: 'active',
        },
      ],
      communityCards: [
        createTestCard('Q', 'hearts'),
        createTestCard('J', 'hearts'),
        createTestCard('10', 'hearts'),
        createTestCard('9', 'spades'),
        createTestCard('4', 'spades'),
      ],
      pot: 300,
      phase: 'showdown',
    };

    const result = evaluateShowdown(gameState);

    expect(result.winners.length).toBe(1);
    expect(result.winners[0].playerIndex).not.toBe(0);
    expect(result.allPlayerResults.length).toBe(2);
  });

  it('should correctly evaluate pair vs high card', () => {
    const gameState = createGameStateWithHands({
      player0Hand: [createTestCard('A', 'hearts'), createTestCard('A', 'clubs')],
      player1Hand: [createTestCard('K', 'diamonds'), createTestCard('Q', 'spades')],
      player2Hand: [createTestCard('2', 'diamonds'), createTestCard('3', 'diamonds')],
      communityCards: [
        createTestCard('5', 'hearts'),
        createTestCard('7', 'hearts'),
        createTestCard('9', 'clubs'),
        createTestCard('J', 'spades'),
        createTestCard('4', 'spades'),
      ],
      pot: 150,
    });

    const result = evaluateShowdown(gameState);

    expect(result.winners.length).toBe(1);
    expect(result.winners[0].playerIndex).toBe(0);
    expect(result.winners[0].evaluation.ranking).toBe('pair');
  });

  it('should handle empty active players', () => {
    const baseGame = createGame();
    const gameState: GameState = {
      ...baseGame,
      players: baseGame.players.map((player) => ({
        ...player,
        status: 'folded' as const,
      })),
      communityCards: [],
      pot: 0,
      phase: 'showdown',
    };

    const result = evaluateShowdown(gameState);

    expect(result.winners.length).toBe(0);
    expect(result.allPlayerResults.length).toBe(0);
    expect(result.potPerWinner).toBe(0);
  });
});

describe('distributePot', () => {
  it('should award pot to single winner', () => {
    const gameState = createGameStateWithHands({
      player0Hand: [createTestCard('A', 'hearts'), createTestCard('K', 'hearts')],
      player1Hand: [createTestCard('2', 'clubs'), createTestCard('3', 'clubs')],
      player2Hand: [createTestCard('7', 'diamonds'), createTestCard('8', 'diamonds')],
      communityCards: [
        createTestCard('Q', 'hearts'),
        createTestCard('J', 'hearts'),
        createTestCard('10', 'hearts'),
        createTestCard('9', 'spades'),
        createTestCard('4', 'spades'),
      ],
      pot: 300,
    });

    const showdownResult = evaluateShowdown(gameState);
    const newState = distributePot(gameState, showdownResult);

    expect(newState.pot).toBe(0);
    expect(newState.players[0].chips).toBe(1300);
    expect(newState.players[1].chips).toBe(1000);
    expect(newState.players[2].chips).toBe(1000);
  });

  it('should split pot between multiple winners', () => {
    const gameState = createGameStateWithHands({
      player0Hand: [createTestCard('A', 'hearts'), createTestCard('K', 'spades')],
      player1Hand: [createTestCard('A', 'clubs'), createTestCard('K', 'diamonds')],
      player2Hand: [createTestCard('2', 'diamonds'), createTestCard('3', 'diamonds')],
      communityCards: [
        createTestCard('Q', 'hearts'),
        createTestCard('J', 'hearts'),
        createTestCard('10', 'hearts'),
        createTestCard('9', 'spades'),
        createTestCard('8', 'spades'),
      ],
      pot: 300,
    });

    const showdownResult = evaluateShowdown(gameState);
    const newState = distributePot(gameState, showdownResult);

    expect(newState.pot).toBe(0);
    expect(newState.players[0].chips).toBe(1150);
    expect(newState.players[1].chips).toBe(1150);
    expect(newState.players[2].chips).toBe(1000);
  });

  it('should handle pot division with remainder', () => {
    const gameState = createGameStateWithHands({
      player0Hand: [createTestCard('A', 'hearts'), createTestCard('K', 'spades')],
      player1Hand: [createTestCard('A', 'clubs'), createTestCard('K', 'diamonds')],
      player2Hand: [createTestCard('2', 'diamonds'), createTestCard('3', 'diamonds')],
      communityCards: [
        createTestCard('Q', 'hearts'),
        createTestCard('J', 'hearts'),
        createTestCard('10', 'hearts'),
        createTestCard('9', 'spades'),
        createTestCard('8', 'spades'),
      ],
      pot: 301,
    });

    const showdownResult = evaluateShowdown(gameState);
    const newState = distributePot(gameState, showdownResult);

    expect(newState.pot).toBe(0);
    expect(newState.players[0].chips).toBe(1150);
    expect(newState.players[1].chips).toBe(1150);
  });
});
