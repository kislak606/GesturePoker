import type { GameState, PlayerAction } from './game.js';
import { evaluateHand, type HandEvaluation } from './hand-evaluator.js';
import type { Card } from './card.js';

const GOOD_POT_ODDS_THRESHOLD = 0.2;
const TERRIBLE_POT_ODDS_THRESHOLD = 0.5;

const BLUFF_PROBABILITY = 0.15;

const RANKING_STRENGTH: Record<HandEvaluation['ranking'], number> = {
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

const evaluatePlayerHand = (
  playerHand: readonly Card[],
  communityCards: readonly Card[]
): HandEvaluation => {
  if (communityCards.length >= 3) {
    const allCards = [...playerHand, ...communityCards];
    return evaluateHand(allCards.slice(0, 5));
  }

  // Pre-flop: evaluate based on pocket cards strength
  // Pad with dummy cards to make 5 cards for evaluation
  const dummyCards: Card[] = [
    { rank: '2', suit: 'clubs' },
    { rank: '3', suit: 'clubs' },
    { rank: '4', suit: 'clubs' },
  ];

  const paddedHand = [...playerHand, ...dummyCards.slice(0, 5 - playerHand.length)];
  return evaluateHand(paddedHand.slice(0, 5));
};

const getHandStrength = (evaluation: HandEvaluation): number => {
  return RANKING_STRENGTH[evaluation.ranking];
};

const shouldBluff = (): boolean => {
  return Math.random() < BLUFF_PROBABILITY;
};

/**
 * Decides what action an AI player should take based on current game state.
 * Uses hand strength evaluation combined with pot odds and randomness.
 */
export const decideAIAction = (
  state: GameState,
  playerIndex: number
): PlayerAction => {
  const player = state.players[playerIndex];
  const callAmount = state.currentBet - player.bet;

  const handEvaluation = evaluatePlayerHand(player.hand, state.communityCards);
  const handStrength = getHandStrength(handEvaluation);

  // If no bet to call
  if (callAmount === 0) {
    // Strong hands should raise
    if (handStrength >= 5) {
      const raiseAmount = state.currentBet + Math.floor(state.pot * 0.5);
      return { type: 'raise', amount: Math.min(raiseAmount, player.chips + player.bet) };
    }

    // Occasionally bluff with weak hands
    if (shouldBluff() && player.chips > 50) {
      const bluffAmount = Math.min(20, player.chips);
      return { type: 'raise', amount: bluffAmount };
    }

    return { type: 'check' };
  }

  // Calculate pot odds
  const potOdds = callAmount / (state.pot + callAmount);

  // Very strong hands (flush or better) - always raise
  if (handStrength >= 6) {
    const raiseAmount = state.currentBet + Math.floor(state.pot * 0.75);
    return { type: 'raise', amount: Math.min(raiseAmount, player.chips + player.bet) };
  }

  // Strong hands (pair or better) with good pot odds
  if (handStrength >= 2 && potOdds < GOOD_POT_ODDS_THRESHOLD) {
    if (handStrength >= 4 && shouldBluff()) {
      const raiseAmount = state.currentBet + Math.floor(state.pot * 0.3);
      return { type: 'raise', amount: Math.min(raiseAmount, player.chips + player.bet) };
    }
    return { type: 'call' };
  }

  // Medium hands - evaluate pot odds
  if (handStrength >= 2) {
    if (potOdds < GOOD_POT_ODDS_THRESHOLD * 1.5) {
      return { type: 'call' };
    }
    return { type: 'fold' };
  }

  // Weak hands - fold unless pot odds are amazing
  if (potOdds > TERRIBLE_POT_ODDS_THRESHOLD) {
    return { type: 'fold' };
  }

  if (potOdds < GOOD_POT_ODDS_THRESHOLD * 0.5) {
    return { type: 'call' };
  }

  return { type: 'fold' };
};
