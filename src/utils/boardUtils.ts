import type { Map2048, Tile } from './gameLogic';

export const rotateMapCounterClockwise = (
  map: Map2048,
  degree: 0 | 90 | 180 | 270,
): Map2048 => {
  const rowLength = map.length;
  const columnLength = map[0]?.length ?? 0;

  switch (degree) {
    case 0:
      return map;
    case 90:
      return Array.from({ length: columnLength }, (_, columnIndex): Tile[] =>
        Array.from(
          { length: rowLength },
          (_, rowIndex): Tile =>
            map[rowIndex]?.[columnLength - columnIndex - 1] ?? null,
        ),
      );
    case 180:
      return Array.from({ length: rowLength }, (_, rowIndex): Tile[] =>
        Array.from(
          { length: columnLength },
          (_, columnIndex): Tile =>
            map[rowLength - rowIndex - 1]?.[columnLength - columnIndex - 1] ??
            null,
        ),
      );
    case 270:
      return Array.from({ length: columnLength }, (_, columnIndex): Tile[] =>
        Array.from(
          { length: rowLength },
          (_, rowIndex): Tile =>
            map[rowLength - rowIndex - 1]?.[columnIndex] ?? null,
        ),
      );
    default:
      throw new Error('Invalid rotation degree');
  }
};
