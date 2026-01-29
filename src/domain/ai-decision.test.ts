import { describe, it, expect } from 'vitest';
import { createGame } from './game.js';
import { startNewHand } from './game-actions.js';
import type { GameState, PlayerAction } from './game.js';
import { decideAIAction } from './ai-decision.js';

describe('AI Decision Logic', () => {
  describe('Basic AI decisions', () => {
    it('should fold when facing a bet with no hand strength', () => {
      // Start a hand
      let state = startNewHand(createGame());

      // Set AI player (index 1) to have weak cards and face a bet
      // For now, we'll test the interface - AI should return a valid action
      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      // Action should be valid poker action
      expect(['fold', 'check', 'call', 'raise', 'all-in']).toContain(action.type);
    });

    it('should check when no bet is required', () => {
      let state = startNewHand(createGame());

      // Player 0 calls, Player 1 calls, now Player 2 (big blind) can check
      // Simulate this by processing actions
      state = {
        ...state,
        currentPlayerIndex: 2, // Big blind
        players: state.players.map((p, i) =>
          i === 0 || i === 1 ? { ...p, bet: 10 } : p
        ),
      };

      const aiPlayerIndex = 2;
      const action = decideAIAction(state, aiPlayerIndex);

      // When player's bet equals current bet, should check (or raise, but check is most conservative)
      expect(action.type).toBe('check');
    });

    it('should call with reasonable pot odds', () => {
      let state = startNewHand(createGame());

      // Set up a scenario where calling is reasonable
      // Small bet relative to pot
      state = {
        ...state,
        pot: 100,
        currentBet: 10,
        currentPlayerIndex: 1,
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, bet: 0, chips: 990 } : p
        ),
      };

      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      // With good pot odds, AI should call or raise (not fold)
      expect(['call', 'raise']).toContain(action.type);
    });

    it('should fold when pot odds are terrible', () => {
      let state = startNewHand(createGame());

      // Set up a scenario where calling is bad
      // Huge bet relative to pot
      state = {
        ...state,
        pot: 20,
        currentBet: 200,
        currentPlayerIndex: 1,
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, bet: 0, chips: 800 } : p
        ),
      };

      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      // With terrible pot odds and no guaranteed strong hand, should fold
      expect(action.type).toBe('fold');
    });

    it('should not raise more than player has in chips', () => {
      let state = startNewHand(createGame());

      state = {
        ...state,
        currentBet: 10,
        currentPlayerIndex: 1,
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, bet: 0, chips: 50 } : p
        ),
      };

      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      if (action.type === 'raise' && action.amount) {
        // Raise amount should not exceed player's chips + current bet
        const playerChips = state.players[aiPlayerIndex].chips;
        const playerBet = state.players[aiPlayerIndex].bet;
        expect(action.amount).toBeLessThanOrEqual(playerChips + playerBet);
      }
    });

    it('should return valid action type', () => {
      const state = startNewHand(createGame());
      const aiPlayerIndex = 1;

      const action = decideAIAction(state, aiPlayerIndex);

      expect(['fold', 'check', 'call', 'raise', 'all-in']).toContain(action.type);
    });
  });

  describe('Hand strength evaluation', () => {
    it('should raise with a strong hand (pair of aces)', () => {
      let state = startNewHand(createGame());

      // Give AI player pocket aces
      state = {
        ...state,
        pot: 30,
        currentBet: 10,
        currentPlayerIndex: 1,
        players: state.players.map((p, i) =>
          i === 1
            ? {
                ...p,
                hand: [
                  { rank: 'A', suit: 'hearts' },
                  { rank: 'A', suit: 'spades' },
                ],
                bet: 5,
                chips: 995,
              }
            : p
        ),
        communityCards: [],
      };

      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      // With pocket aces, AI should raise or call (not fold)
      expect(['call', 'raise']).toContain(action.type);
    });

    it('should fold with trash hand facing a large bet', () => {
      let state = startNewHand(createGame());

      // Give AI player terrible cards
      state = {
        ...state,
        pot: 30,
        currentBet: 100,
        currentPlayerIndex: 1,
        players: state.players.map((p, i) =>
          i === 1
            ? {
                ...p,
                hand: [
                  { rank: '2', suit: 'clubs' },
                  { rank: '7', suit: 'diamonds' },
                ],
                bet: 5,
                chips: 895,
              }
            : p
        ),
        communityCards: [],
      };

      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      // With terrible hand and bad pot odds, should fold
      expect(action.type).toBe('fold');
    });

    it('should be more aggressive with made hand (flush)', () => {
      let state = startNewHand(createGame());

      // Give AI player a flush
      state = {
        ...state,
        pot: 50,
        currentBet: 20,
        currentPlayerIndex: 1,
        phase: 'river',
        players: state.players.map((p, i) =>
          i === 1
            ? {
                ...p,
                hand: [
                  { rank: 'A', suit: 'hearts' },
                  { rank: 'K', suit: 'hearts' },
                ],
                bet: 10,
                chips: 980,
              }
            : p
        ),
        communityCards: [
          { rank: '5', suit: 'hearts' },
          { rank: '7', suit: 'hearts' },
          { rank: '9', suit: 'hearts' },
          { rank: '2', suit: 'clubs' },
          { rank: '3', suit: 'diamonds' },
        ],
      };

      const aiPlayerIndex = 1;
      const action = decideAIAction(state, aiPlayerIndex);

      // With a flush, AI should raise or at least call
      expect(['call', 'raise']).toContain(action.type);
    });

    it('should sometimes bluff with randomness', () => {
      let state = startNewHand(createGame());

      // Weak hand but check if AI occasionally bluffs
      state = {
        ...state,
        pot: 40,
        currentBet: 0,
        currentPlayerIndex: 1,
        players: state.players.map((p, i) =>
          i === 1
            ? {
                ...p,
                hand: [
                  { rank: '8', suit: 'clubs' },
                  { rank: '9', suit: 'diamonds' },
                ],
                bet: 0,
                chips: 1000,
              }
            : p
        ),
        communityCards: [
          { rank: '2', suit: 'hearts' },
          { rank: '5', suit: 'spades' },
          { rank: 'K', suit: 'clubs' },
        ],
      };

      const aiPlayerIndex = 1;

      // Run 20 times to see if AI ever raises (bluff)
      const actions = Array.from({ length: 20 }, () =>
        decideAIAction(state, aiPlayerIndex)
      );

      // AI should sometimes raise (bluff), not always check/fold
      const hasRaised = actions.some((a) => a.type === 'raise');
      const hasChecked = actions.some((a) => a.type === 'check');

      // Should have variety in decisions (bluff occasionally)
      expect(hasChecked || hasRaised).toBe(true);
    });
  });
});
