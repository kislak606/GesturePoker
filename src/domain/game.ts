import { z } from 'zod';
import type { Card } from './card.js';
import { createDeck, shuffleDeck } from './deck.js';

export const PlayerStatusSchema = z.enum(['active', 'folded', 'all-in', 'out']);
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  chips: z.number().min(0),
  hand: z.array(z.any()).readonly(), // Card array
  bet: z.number().min(0),
  status: PlayerStatusSchema,
  isHuman: z.boolean(),
});
export type Player = {
  readonly id: string;
  readonly name: string;
  readonly chips: number;
  readonly hand: readonly Card[];
  readonly bet: number;
  readonly status: PlayerStatus;
  readonly isHuman: boolean;
};

export const GamePhaseSchema = z.enum([
  'waiting',
  'pre-flop',
  'flop',
  'turn',
  'river',
  'showdown',
]);
export type GamePhase = z.infer<typeof GamePhaseSchema>;

export const GameStateSchema = z.object({
  players: z.array(PlayerSchema).readonly(),
  deck: z.array(z.any()).readonly(), // Card array
  communityCards: z.array(z.any()).readonly(), // Card array
  pot: z.number().min(0),
  currentPlayerIndex: z.number().min(0),
  dealerIndex: z.number().min(0),
  phase: GamePhaseSchema,
  currentBet: z.number().min(0),
  lastRaiserIndex: z.number().min(-1), // -1 means no raise yet this round
});
export type GameState = {
  readonly players: readonly Player[];
  readonly deck: readonly Card[];
  readonly communityCards: readonly Card[];
  readonly pot: number;
  readonly currentPlayerIndex: number;
  readonly dealerIndex: number;
  readonly phase: GamePhase;
  readonly currentBet: number;
  readonly lastRaiserIndex: number; // -1 means no raise yet this round
};

export const PlayerActionTypeSchema = z.enum([
  'fold',
  'check',
  'call',
  'raise',
  'all-in',
]);
export type PlayerActionType = z.infer<typeof PlayerActionTypeSchema>;

export type PlayerAction = {
  readonly type: PlayerActionType;
  readonly amount?: number;
};

type CreatePlayerOptions = {
  readonly id: string;
  readonly name: string;
  readonly isHuman: boolean;
  readonly chips?: number;
};

const DEFAULT_STARTING_CHIPS = 1000;

export const createPlayer = (options: CreatePlayerOptions): Player => {
  return PlayerSchema.parse({
    id: options.id,
    name: options.name,
    chips: options.chips ?? DEFAULT_STARTING_CHIPS,
    hand: [],
    bet: 0,
    status: 'active',
    isHuman: options.isHuman,
  });
};

export const createGame = (): GameState => {
  const players: Player[] = [
    createPlayer({ id: 'human', name: 'You', isHuman: true }),
    createPlayer({ id: 'ai-1', name: 'Bot 1', isHuman: false }),
    createPlayer({ id: 'ai-2', name: 'Bot 2', isHuman: false }),
  ];

  const deck = shuffleDeck(createDeck());

  return GameStateSchema.parse({
    players,
    deck,
    communityCards: [],
    pot: 0,
    currentPlayerIndex: 1, // Player after dealer starts
    dealerIndex: 0,
    phase: 'waiting',
    currentBet: 0,
    lastRaiserIndex: -1,
  });
};
