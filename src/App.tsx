import './App.css';

import React, { useEffect, useState } from 'react';

type Tile = number | null;
type Map2048 = Tile[][];
type Direction = 'up' | 'left' | 'right' | 'down';

const moveMapIn2048Rule = (
  map: Map2048,
  direction: Direction,
  setScore: React.Dispatch<React.SetStateAction<number>>,
): { result: Map2048; isMoved: boolean } => {
  if (!validateMapIsNByM(map)) throw new Error('Map is not N by M');
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

const validateMapIsNByM = (map: Map2048): boolean => {
  const firstColumnCount = map[0]?.length ?? 0;
  return map.every((row) => row.length === firstColumnCount);
};

const rotateMapCounterClockwise = (
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

const moveLeft = (
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

const moveRowLeft = (
  row: Tile[],
): { result: Tile[]; isMoved: boolean; rowScore: number } => {
  let rowScore = 0;

  const reduced = row.reduce(
    (acc: { lastCell: Tile | null; result: Tile[] }, cell) => {
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

const createBoard = (): Map2048 => {
  const board: Map2048 = Array.from(
    { length: 4 },
    (): Tile[] => Array(4).fill(null) as Tile[],
  );
  addRandomTile(board);
  addRandomTile(board);
  return board;
};

const addRandomTile = (board: Map2048): void => {
  const emptyTiles: { row: number; col: number }[] = [];

  for (let row = 0; row < board.length; row++) {
    const currentRow = board[row];
    if (currentRow !== undefined && Array.isArray(currentRow)) {
      for (let col = 0; col < currentRow.length; col++) {
        if (currentRow[col] === null) {
          emptyTiles.push({ row, col });
        }
      }
    }
  }

  if (emptyTiles.length > 0) {
    const randomTile =
      emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

    if (
      randomTile !== undefined &&
      randomTile.row >= 0 &&
      randomTile.row < board.length &&
      board[randomTile.row] !== undefined &&
      Array.isArray(board[randomTile.row]) &&
      randomTile.col >= 0 &&
      randomTile.col < (board[randomTile.row] as Tile[]).length
    ) {
      const currentRow = board[randomTile.row] as Tile[];
      if (currentRow[randomTile.col] === null) {
        currentRow[randomTile.col] = Math.random() < 0.75 ? 2 : 4;
      }
    }
  }
};

const App: React.FC = () => {
  const [board, setBoard] = useState<Map2048>(createBoard);
  const [prevBoard, setPrevBoard] = useState<Map2048 | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver) return;

      let newBoardState = { result: board, isMoved: false };
      if (event.key === 'ArrowUp') {
        newBoardState = moveMapIn2048Rule(board, 'up', setScore);
      } else if (event.key === 'ArrowDown') {
        newBoardState = moveMapIn2048Rule(board, 'down', setScore);
      } else if (event.key === 'ArrowLeft') {
        newBoardState = moveMapIn2048Rule(board, 'left', setScore);
      } else if (event.key === 'ArrowRight') {
        newBoardState = moveMapIn2048Rule(board, 'right', setScore);
      }

      if (newBoardState.isMoved) {
        setPrevBoard(board);
        setPrevScore(score);
        addRandomTile(newBoardState.result);
        setBoard(newBoardState.result);

        if (newBoardState.result.flat().includes(128)) {
          setGameOver(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, gameOver, score]);

  const resetGame = () => {
    setBoard(createBoard());
    setScore(0);
    setPrevBoard(null);
    setPrevScore(0);
    setGameOver(false);
  };

  const undoMove = () => {
    if (prevBoard !== null) {
      setBoard(prevBoard);
      setScore(prevScore);
      setPrevBoard(null);
    }
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex' }}>
        {row.map((tile, colIndex) => (
          <div
            key={colIndex}
            style={{
              width: '50px',
              height: '50px',
              border: '1px solid black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: tile !== null ? 'lightgray' : 'white',
            }}
          >
            {tile}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>128 게임</h1>
      <h2>점수: {score}</h2>
      {gameOver ? (
        <div>
          <h1>축하합니다! 128을 만드셨습니다!</h1>
          <button
            onClick={resetGame}
            style={{ marginTop: '10px', padding: '10px' }}
          >
            다시하기
          </button>
        </div>
      ) : (
        <div>
          {renderBoard()}
          <button
            onClick={resetGame}
            style={{ marginTop: '10px', padding: '10px' }}
          >
            다시하기
          </button>
          <button
            onClick={undoMove}
            style={{ marginTop: '10px', marginLeft: '10px', padding: '10px' }}
            disabled={prevBoard === null}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
export { moveLeft };
export type { Map2048 };
