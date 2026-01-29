import type { GameState, Player } from './game.js';
import type { Card } from './card.js';
import {
  evaluateHand,
  compareHands,
  type HandEvaluation,
} from './hand-evaluator.js';

export type PlayerHandResult = {
  readonly player: Player;
  readonly playerIndex: number;
  readonly bestHand: readonly Card[];
  readonly evaluation: HandEvaluation;
};

export type ShowdownResult = {
  readonly winners: readonly PlayerHandResult[];
  readonly allPlayerResults: readonly PlayerHandResult[];
  readonly potPerWinner: number;
};

const getAllPossibleHands = (
  playerHand: readonly Card[],
  communityCards: readonly Card[]
): readonly (readonly Card[])[] => {
  const allCards = [...playerHand, ...communityCards];
  const hands: (readonly Card[])[] = [];

  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      for (let k = j + 1; k < allCards.length; k++) {
        for (let l = k + 1; l < allCards.length; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            hands.push([allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]]);
          }
        }
      }
    }
  }

  return hands;
};

const findBestHand = (
  playerHand: readonly Card[],
  communityCards: readonly Card[]
): readonly Card[] => {
  const allPossibleHands = getAllPossibleHands(playerHand, communityCards);

  let bestHand = allPossibleHands[0];

  for (const hand of allPossibleHands) {
    if (compareHands(hand, bestHand) > 0) {
      bestHand = hand;
    }
  }

  return bestHand;
};

export const evaluateShowdown = (gameState: GameState): ShowdownResult => {
  const activePlayers = gameState.players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.status !== 'folded');

  const playerResults: PlayerHandResult[] = activePlayers.map(
    ({ player, index }) => {
      const bestHand = findBestHand(player.hand, gameState.communityCards);
      const evaluation = evaluateHand(bestHand);

      return {
        player,
        playerIndex: index,
        bestHand,
        evaluation,
      };
    }
  );

  if (playerResults.length === 0) {
    return {
      winners: [],
      allPlayerResults: [],
      potPerWinner: 0,
    };
  }

  let winners = [playerResults[0]];
  let bestHand = winners[0].bestHand;

  for (let i = 1; i < playerResults.length; i++) {
    const comparison = compareHands(playerResults[i].bestHand, bestHand);

    if (comparison > 0) {
      winners = [playerResults[i]];
      bestHand = playerResults[i].bestHand;
    } else if (comparison === 0) {
      winners = [...winners, playerResults[i]];
    }
  }

  const potPerWinner = Math.floor(gameState.pot / winners.length);

  return {
    winners,
    allPlayerResults: playerResults,
    potPerWinner,
  };
};

export const distributePot = (
  gameState: GameState,
  showdownResult: ShowdownResult
): GameState => {
  const updatedPlayers = gameState.players.map((player, index) => {
    const isWinner = showdownResult.winners.some(
      (winner) => winner.playerIndex === index
    );

    if (isWinner) {
      return {
        ...player,
        chips: player.chips + showdownResult.potPerWinner,
      };
    }

    return player;
  });

  return {
    ...gameState,
    players: updatedPlayers,
    pot: 0,
  };
};

export const getHandRankingDisplayName = (
  evaluation: HandEvaluation
): string => {
  const rankingNames: Record<HandEvaluation['ranking'], string> = {
    'royal-flush': 'Royal Flush',
    'straight-flush': 'Straight Flush',
    'four-of-a-kind': 'Four of a Kind',
    'full-house': 'Full House',
    'flush': 'Flush',
    'straight': 'Straight',
    'three-of-a-kind': 'Three of a Kind',
    'two-pair': 'Two Pair',
    'pair': 'Pair',
    'high-card': 'High Card',
  };

  return rankingNames[evaluation.ranking];
};
