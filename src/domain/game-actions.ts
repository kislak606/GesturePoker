import type { GameState, PlayerAction } from './game.js';
import type { Card } from './card.js';
import { createDeck, shuffleDeck, dealCards } from './deck.js';

const SMALL_BLIND = 5;
const BIG_BLIND = 10;

export const startNewHand = (state: GameState): GameState => {
  // Create a fresh shuffled deck for the new hand
  let remainingDeck = shuffleDeck(createDeck());

  // Deal 2 cards to each player
  const updatedPlayers = state.players.map((player) => {
    const { cards, remainingDeck: newDeck } = dealCards(remainingDeck, 2);
    remainingDeck = newDeck;
    return {
      ...player,
      hand: cards,
      bet: 0,
      status: 'active' as const,
    };
  });

  // Post blinds
  const smallBlindIndex = (state.dealerIndex + 1) % state.players.length;
  const bigBlindIndex = (state.dealerIndex + 2) % state.players.length;

  const playersWithBlinds = updatedPlayers.map((player, index) => {
    if (index === smallBlindIndex) {
      return {
        ...player,
        bet: SMALL_BLIND,
        chips: player.chips - SMALL_BLIND,
      };
    }
    if (index === bigBlindIndex) {
      return {
        ...player,
        bet: BIG_BLIND,
        chips: player.chips - BIG_BLIND,
      };
    }
    return player;
  });

  // First to act is player after big blind
  const firstToAct = (bigBlindIndex + 1) % state.players.length;

  return {
    ...state,
    players: playersWithBlinds,
    deck: remainingDeck,
    communityCards: [],
    pot: SMALL_BLIND + BIG_BLIND,
    currentBet: BIG_BLIND,
    phase: 'pre-flop',
    currentPlayerIndex: firstToAct,
    lastRaiserIndex: bigBlindIndex, // Big blind is the initial "raiser"
  };
};

const advanceToNextPhase = (state: GameState): GameState => {
  const phaseTransitions: Record<string, { phase: GameState['phase']; cardsToDeal: number }> = {
    'pre-flop': { phase: 'flop', cardsToDeal: 3 },
    'flop': { phase: 'turn', cardsToDeal: 1 },
    'turn': { phase: 'river', cardsToDeal: 1 },
    'river': { phase: 'showdown', cardsToDeal: 0 },
  };

  const transition = phaseTransitions[state.phase];
  if (!transition) {
    return state;
  }

  let newCommunityCards: readonly Card[] = [...state.communityCards];
  let remainingDeck: readonly Card[] = [...state.deck];

  if (transition.cardsToDeal > 0) {
    const { cards, remainingDeck: newDeck } = dealCards(remainingDeck, transition.cardsToDeal);
    newCommunityCards = [...newCommunityCards, ...cards];
    remainingDeck = newDeck;
  }

  // Reset bets for next round
  const playersWithResetBets = state.players.map((player) => ({
    ...player,
    bet: 0,
  }));

  return {
    ...state,
    phase: transition.phase,
    communityCards: newCommunityCards,
    deck: remainingDeck,
    players: playersWithResetBets,
    currentBet: 0,
    currentPlayerIndex: (state.dealerIndex + 1) % state.players.length,
    lastRaiserIndex: -1, // Reset for new round
  };
};

const isRoundComplete = (state: GameState, nextPlayerIndex: number): boolean => {
  const activePlayers = state.players.filter((p) => p.status === 'active');

  // If only one player left, round is complete
  if (activePlayers.length <= 1) {
    return true;
  }

  // Check if all active players have acted and all bets are equal
  const allBetsEqual = activePlayers.every((p) => p.bet === state.currentBet);

  // If no one has raised (or if it's the start of a new round after blinds),
  // action goes back to first player after dealer
  if (state.lastRaiserIndex === -1) {
    const firstActiveAfterDealer = (state.dealerIndex + 1) % state.players.length;
    return allBetsEqual && nextPlayerIndex === firstActiveAfterDealer;
  }

  // Otherwise, action is complete when we get back to the last raiser
  return allBetsEqual && nextPlayerIndex === state.lastRaiserIndex;
};

export const processPlayerAction = (
  state: GameState,
  action: PlayerAction
): GameState => {
  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.status !== 'active') {
    throw new Error('Current player is not active');
  }

  let updatedPlayers = [...state.players];
  let newPot = state.pot;
  let newCurrentBet = state.currentBet;
  let newLastRaiserIndex = state.lastRaiserIndex;

  switch (action.type) {
    case 'fold':
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        status: 'folded',
      };
      break;

    case 'check':
      if (currentPlayer.bet < state.currentBet) {
        throw new Error('Cannot check when there is a bet to call');
      }
      // No changes needed for check
      break;

    case 'call': {
      const callAmount = state.currentBet - currentPlayer.bet;
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        bet: state.currentBet,
        chips: currentPlayer.chips - callAmount,
      };
      newPot += callAmount;
      break;
    }

    case 'raise': {
      if (!action.amount || action.amount <= state.currentBet) {
        throw new Error('Raise amount must be greater than current bet');
      }
      const raiseAmount = action.amount - currentPlayer.bet;
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        bet: action.amount,
        chips: currentPlayer.chips - raiseAmount,
      };
      newPot += raiseAmount;
      newCurrentBet = action.amount;
      newLastRaiserIndex = state.currentPlayerIndex; // Track who raised
      break;
    }

    case 'all-in': {
      const allInAmount = currentPlayer.chips;
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        bet: currentPlayer.bet + allInAmount,
        chips: 0,
        status: 'all-in',
      };
      newPot += allInAmount;
      if (currentPlayer.bet + allInAmount > state.currentBet) {
        newCurrentBet = currentPlayer.bet + allInAmount;
        newLastRaiserIndex = state.currentPlayerIndex; // All-in counts as raise if it increases bet
      }
      break;
    }
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  let newState: GameState = {
    ...state,
    players: updatedPlayers,
    pot: newPot,
    currentBet: newCurrentBet,
    currentPlayerIndex: nextPlayerIndex,
    lastRaiserIndex: newLastRaiserIndex,
  };

  // Check if round is complete and advance phase if needed
  if (isRoundComplete(newState, nextPlayerIndex)) {
    newState = advanceToNextPhase(newState);
  }

  return newState;
};
