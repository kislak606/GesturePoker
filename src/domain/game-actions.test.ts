import { describe, it, expect } from 'vitest';
import { createGame } from './game.js';
import { startNewHand, processPlayerAction } from './game-actions.js';

describe('Game Actions', () => {
  describe('startNewHand', () => {
    it('should deal 2 cards to each player', () => {
      const initialState = createGame();

      const newState = startNewHand(initialState);

      expect(newState.players[0].hand.length).toBe(2);
      expect(newState.players[1].hand.length).toBe(2);
      expect(newState.players[2].hand.length).toBe(2);
    });

    it('should set phase to pre-flop', () => {
      const initialState = createGame();

      const newState = startNewHand(initialState);

      expect(newState.phase).toBe('pre-flop');
    });

    it('should post small blind and big blind', () => {
      const initialState = createGame();

      const newState = startNewHand(initialState);

      // Small blind is player after dealer (player 1)
      expect(newState.players[1].bet).toBe(5); // Small blind
      expect(newState.players[1].chips).toBe(995);

      // Big blind is next player (player 2)
      expect(newState.players[2].bet).toBe(10); // Big blind
      expect(newState.players[2].chips).toBe(990);

      expect(newState.pot).toBe(15);
      expect(newState.currentBet).toBe(10);
    });

    it('should set current player to first player after big blind', () => {
      const initialState = createGame();

      const newState = startNewHand(initialState);

      // First to act is player after big blind (player 0 - the dealer in this case)
      expect(newState.currentPlayerIndex).toBe(0);
    });
  });

  describe('processPlayerAction - fold', () => {
    it('should mark player as folded', () => {
      const state = startNewHand(createGame());

      const newState = processPlayerAction(state, { type: 'fold' });

      expect(newState.players[0].status).toBe('folded');
    });

    it('should move to next player', () => {
      const state = startNewHand(createGame());
      const currentPlayer = state.currentPlayerIndex;

      const newState = processPlayerAction(state, { type: 'fold' });

      expect(newState.currentPlayerIndex).toBe((currentPlayer + 1) % 3);
    });
  });

  describe('processPlayerAction - check', () => {
    it('should allow check when current bet equals player bet', () => {
      const state = startNewHand(createGame());
      // Player 0 needs to call to 10 first, can't check yet
      const stateAfterCall = processPlayerAction(state, { type: 'call' });
      // Player 1 (small blind) can now check since they called
      const stateAfterP1Call = processPlayerAction(stateAfterCall, { type: 'call' });
      // Player 2 (big blind) can check since current bet equals their bet
      // This check completes the pre-flop round and advances to flop
      const finalState = processPlayerAction(stateAfterP1Call, { type: 'check' });

      // Round advanced to flop, so bets are reset
      expect(finalState.phase).toBe('flop');
      expect(finalState.players[2].bet).toBe(0);
      expect(finalState.currentBet).toBe(0);
    });

    it('should not allow check when player needs to call', () => {
      const state = startNewHand(createGame());

      expect(() => processPlayerAction(state, { type: 'check' })).toThrow();
    });
  });

  describe('processPlayerAction - call', () => {
    it('should match current bet', () => {
      const state = startNewHand(createGame());
      // Player 0 needs to call 10

      const newState = processPlayerAction(state, { type: 'call' });

      expect(newState.players[0].bet).toBe(10);
      expect(newState.players[0].chips).toBe(990);
      expect(newState.pot).toBe(25); // 15 + 10
    });

    it('should move to next player', () => {
      const state = startNewHand(createGame());

      const newState = processPlayerAction(state, { type: 'call' });

      expect(newState.currentPlayerIndex).toBe(1);
    });
  });

  describe('processPlayerAction - raise', () => {
    it('should increase current bet', () => {
      const state = startNewHand(createGame());

      const newState = processPlayerAction(state, { type: 'raise', amount: 30 });

      expect(newState.players[0].bet).toBe(30);
      expect(newState.players[0].chips).toBe(970);
      expect(newState.currentBet).toBe(30);
      expect(newState.pot).toBe(45); // 15 + 30
    });

    it('should require amount to be greater than current bet', () => {
      const state = startNewHand(createGame());

      expect(() => processPlayerAction(state, { type: 'raise', amount: 5 })).toThrow();
    });
  });

  describe('Betting round completion', () => {
    it('should advance to flop when all players act and bets are equal', () => {
      let state = startNewHand(createGame());

      // Player 0 calls
      state = processPlayerAction(state, { type: 'call' });
      // Player 1 calls (small blind needs to add 5)
      state = processPlayerAction(state, { type: 'call' });
      // Player 2 checks (big blind)
      state = processPlayerAction(state, { type: 'check' });

      expect(state.phase).toBe('flop');
      expect(state.communityCards.length).toBe(3);
      expect(state.currentBet).toBe(0);
      expect(state.players[0].bet).toBe(0);
      expect(state.players[1].bet).toBe(0);
      expect(state.players[2].bet).toBe(0);
    });

    it('should advance to turn after flop betting round', () => {
      let state = startNewHand(createGame());

      // Complete pre-flop
      state = processPlayerAction(state, { type: 'call' });
      state = processPlayerAction(state, { type: 'call' });
      state = processPlayerAction(state, { type: 'check' });

      expect(state.phase).toBe('flop');

      // Complete flop
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });

      expect(state.phase).toBe('turn');
      expect(state.communityCards.length).toBe(4);
    });

    it('should advance to river after turn betting round', () => {
      let state = startNewHand(createGame());

      // Complete pre-flop
      state = processPlayerAction(state, { type: 'call' });
      state = processPlayerAction(state, { type: 'call' });
      state = processPlayerAction(state, { type: 'check' });

      // Complete flop
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });

      // Complete turn
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });

      expect(state.phase).toBe('river');
      expect(state.communityCards.length).toBe(5);
    });

    it('should advance to showdown after river betting round', () => {
      let state = startNewHand(createGame());

      // Complete all rounds
      state = processPlayerAction(state, { type: 'call' });
      state = processPlayerAction(state, { type: 'call' });
      state = processPlayerAction(state, { type: 'check' });

      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });

      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });

      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });
      state = processPlayerAction(state, { type: 'check' });

      expect(state.phase).toBe('showdown');
    });
  });
});
