import { describe, it, expect } from 'vitest';
import {
  PlayerSchema,
  GameStateSchema,
  createPlayer,
  createGame,
  type Player,
  type GameState,
  type PlayerAction,
} from './game.js';
import type { Card } from './card.js';

describe('Player', () => {
  describe('PlayerSchema', () => {
    it('should validate a valid player', () => {
      const player: Player = {
        id: 'player-1',
        name: 'Alice',
        chips: 1000,
        hand: [],
        bet: 0,
        status: 'active',
        isHuman: true,
      };

      const result = PlayerSchema.safeParse(player);

      expect(result.success).toBe(true);
    });

    it('should reject negative chips', () => {
      const player = {
        id: 'player-1',
        name: 'Alice',
        chips: -100,
        hand: [],
        bet: 0,
        status: 'active',
        isHuman: true,
      };

      const result = PlayerSchema.safeParse(player);

      expect(result.success).toBe(false);
    });

    it('should reject negative bet', () => {
      const player = {
        id: 'player-1',
        name: 'Alice',
        chips: 1000,
        hand: [],
        bet: -50,
        status: 'active',
        isHuman: true,
      };

      const result = PlayerSchema.safeParse(player);

      expect(result.success).toBe(false);
    });
  });

  describe('createPlayer', () => {
    it('should create a human player with default chips', () => {
      const player = createPlayer({
        id: 'player-1',
        name: 'Alice',
        isHuman: true,
      });

      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.isHuman).toBe(true);
      expect(player.chips).toBe(1000);
      expect(player.hand).toEqual([]);
      expect(player.bet).toBe(0);
      expect(player.status).toBe('active');
    });

    it('should create an AI player with custom chips', () => {
      const player = createPlayer({
        id: 'ai-1',
        name: 'Bot 1',
        isHuman: false,
        chips: 500,
      });

      expect(player.id).toBe('ai-1');
      expect(player.name).toBe('Bot 1');
      expect(player.isHuman).toBe(false);
      expect(player.chips).toBe(500);
    });
  });
});

describe('GameState', () => {
  describe('GameStateSchema', () => {
    it('should validate a valid game state', () => {
      const gameState: GameState = {
        players: [
          createPlayer({ id: 'p1', name: 'Alice', isHuman: true }),
          createPlayer({ id: 'p2', name: 'Bot 1', isHuman: false }),
          createPlayer({ id: 'p3', name: 'Bot 2', isHuman: false }),
        ],
        deck: [],
        communityCards: [],
        pot: 0,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'waiting',
        currentBet: 0,
        lastRaiserIndex: -1,
      };

      const result = GameStateSchema.safeParse(gameState);

      expect(result.success).toBe(true);
    });

    it('should reject invalid phase', () => {
      const gameState = {
        players: [createPlayer({ id: 'p1', name: 'Alice', isHuman: true })],
        deck: [],
        communityCards: [],
        pot: 0,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'invalid-phase',
        currentBet: 0,
      };

      const result = GameStateSchema.safeParse(gameState);

      expect(result.success).toBe(false);
    });

    it('should reject negative pot', () => {
      const gameState = {
        players: [createPlayer({ id: 'p1', name: 'Alice', isHuman: true })],
        deck: [],
        communityCards: [],
        pot: -100,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        phase: 'waiting',
        currentBet: 0,
      };

      const result = GameStateSchema.safeParse(gameState);

      expect(result.success).toBe(false);
    });
  });

  describe('createGame', () => {
    it('should create a new game with 3 players', () => {
      const game = createGame();

      expect(game.players.length).toBe(3);
      expect(game.players[0].isHuman).toBe(true);
      expect(game.players[1].isHuman).toBe(false);
      expect(game.players[2].isHuman).toBe(false);
      expect(game.pot).toBe(0);
      expect(game.phase).toBe('waiting');
      expect(game.deck.length).toBe(52);
    });

    it('should initialize all players with starting chips', () => {
      const game = createGame();

      game.players.forEach((player) => {
        expect(player.chips).toBe(1000);
        expect(player.bet).toBe(0);
        expect(player.status).toBe('active');
        expect(player.hand).toEqual([]);
      });
    });

    it('should set dealer to first player', () => {
      const game = createGame();

      expect(game.dealerIndex).toBe(0);
    });

    it('should set current player to player after dealer', () => {
      const game = createGame();

      expect(game.currentPlayerIndex).toBe(1);
    });
  });
});
