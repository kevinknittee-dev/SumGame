/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'classic' | 'time';

export interface Block {
  id: string;
  value: number;
  x: number; // 0 to 5 (6 columns)
  y: number; // 0 to 9 (10 rows, 0 is top)
  isNew?: boolean;
}

export interface GameState {
  blocks: Block[];
  targetSum: number;
  selectedIds: string[];
  score: number;
  gameOver: boolean;
  mode: GameMode;
  timeLeft: number; // For time mode
  level: number;
}

export const COLS = 6;
export const ROWS = 10;
export const INITIAL_ROWS = 5;
export const TIME_LIMIT = 15; // seconds per round in time mode
