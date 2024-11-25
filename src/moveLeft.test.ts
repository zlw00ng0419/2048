import { describe, expect, it } from 'vitest';

import type { Map2048 } from '../src/utils/gameLogic';
import { moveLeft } from '../src/utils/gameLogic';

describe('moveLeft', () => {
  it('should move tiles to the left and merge correctly', () => {
    const input: Map2048 = [
      [2, 2, null, null],
      [4, 4, null, 4],
      [null, null, 2, 2],
      [2, null, null, 2],
    ];
    const expected: Map2048 = [
      [4, null, null, null],
      [8, 4, null, null],
      [4, null, null, null],
      [4, null, null, null],
    ];

    const { result, isMoved, score } = moveLeft(input);
    expect(result).toEqual(expected);
    expect(isMoved).toBe(true);
    expect(score).toBe(20);
  });

  it('should return the same map if no movement is possible', () => {
    const input: Map2048 = [
      [2, 4, 8, 16],
      [2, 4, 8, 16],
      [2, 4, 8, 16],
      [2, 4, 8, 16],
    ];

    const { result, isMoved, score } = moveLeft(input);
    expect(result).toEqual(input);
    expect(isMoved).toBe(false);
    expect(score).toBe(0);
  });

  it('should handle empty rows correctly', () => {
    const input: Map2048 = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [2, 2, null, null],
    ];
    const expected: Map2048 = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [4, null, null, null],
    ];

    const { result, isMoved, score } = moveLeft(input);
    expect(result).toEqual(expected);
    expect(isMoved).toBe(true);
    expect(score).toBe(4);
  });
});
