import { z } from 'zod';

export const SuitSchema = z.enum(['hearts', 'diamonds', 'clubs', 'spades']);
export type Suit = z.infer<typeof SuitSchema>;

export const RankSchema = z.enum([
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
]);
export type Rank = z.infer<typeof RankSchema>;

export const CardSchema = z.object({
  suit: SuitSchema,
  rank: RankSchema,
});
export type Card = z.infer<typeof CardSchema>;
