import { rotateMapCounterClockwise } from './boardUtils';

export type Tile = number | null;
export type Map2048 = Tile[][];
export type Direction = 'up' | 'left' | 'right' | 'down';

const rotateDegreeMap: Record<Direction, 0 | 90 | 180 | 270> = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

const revertDegreeMap: Record<Direction, 0 | 90 | 180 | 270> = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};

export const moveMapIn2048Rule = (
  map: Map2048,
  direction: Direction,
  setScore: React.Dispatch<React.SetStateAction<number>>,
): { result: Map2048; isMoved: boolean } => {
  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);
  const { result, isMoved, score } = moveLeft(rotatedMap);

  if (score > 0) {
    setScore((prevScore) => prevScore + score);
  }

  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
  };
};

export const moveLeft = (
  map: Map2048,
): { result: Map2048; isMoved: boolean; score: number } => {
  let score = 0;
  const movedRows = map.map((row) => {
    const { result, isMoved, rowScore } = moveRowLeft(row);
    score += rowScore;
    return { result, isMoved };
  });

  const result: Map2048 = movedRows.map((movedRow) => movedRow.result);
  const isMoved = movedRows.some((movedRow) => movedRow.isMoved);
  return { result, isMoved, score };
};

export const moveRowLeft = (
  row: Tile[],
): { result: Tile[]; isMoved: boolean; rowScore: number } => {
  let rowScore = 0;

  const reduced = row.reduce<{ lastCell: Tile | null; result: Tile[] }>(
    (acc, cell) => {
      if (cell === null) {
        return acc;
      } else if (acc.lastCell === null) {
        return { ...acc, lastCell: cell };
      } else if (acc.lastCell === cell) {
        rowScore += cell * 2;
        return { result: [...acc.result, cell * 2], lastCell: null };
      } else {
        return { result: [...acc.result, acc.lastCell], lastCell: cell };
      }
    },
    { lastCell: null, result: [] },
  );

  const result: Tile[] = [...reduced.result, reduced.lastCell].filter(
    (val): val is Tile => val !== null,
  );

  const resultRow: Tile[] = Array.from(
    { length: row.length },
    (_, i) => result[i] ?? null,
  );

  return {
    result: resultRow,
    isMoved: row.some((cell, i) => cell !== resultRow[i]),
    rowScore,
  };
};

export const createBoard = (): Map2048 => {
  const board: Map2048 = Array.from(
    { length: 4 },
    (): Tile[] => Array(4).fill(null) as Tile[],
  );
  addRandomTile(board);
  addRandomTile(board);
  return board;
};

export const addRandomTile = (board: Map2048): void => {
  const emptyTiles: { row: number; col: number }[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile === null) emptyTiles.push({ row: rowIndex, col: colIndex });
    });
  });

  if (emptyTiles.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const randomTile = emptyTiles[randomIndex];

    if (randomTile !== undefined) {
      const { row, col } = randomTile;

      const targetRow = board[row];
      if (targetRow !== undefined && col >= 0 && col < targetRow.length) {
        targetRow[col] = Math.random() < 0.75 ? 2 : 4;
      }
    }
  }
};
