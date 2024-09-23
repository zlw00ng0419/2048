import './App.css';

import React, { useEffect, useState } from 'react';

// 기본 타입 정의
type Tile = number | null;
type Map2048 = Tile[][];
type Direction = 'up' | 'left' | 'right' | 'down';

// 2048 맵을 이동시키는 함수 정의
const moveMapIn2048Rule = (
  map: Map2048,
  direction: Direction,
  setScore: React.Dispatch<React.SetStateAction<number>>, // 점수를 업데이트하기 위한 함수 전달
): { result: Map2048; isMoved: boolean } => {
  if (!validateMapIsNByM(map)) throw new Error('Map is not N by M');

  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);
  const { result, isMoved, score } = moveLeft(rotatedMap);

  if (score > 0) {
    setScore((prevScore) => prevScore + score); // 합쳐진 타일 점수를 추가
  }

  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
  };
};

// 맵의 유효성을 검증하는 함수
const validateMapIsNByM = (map: Map2048): boolean => {
  const firstColumnCount = map[0]?.length ?? 0;
  return map.every((row) => row.length === firstColumnCount);
};

// 맵을 회전하는 로직
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

// 타일을 왼쪽으로 이동하는 로직
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

// 각 줄을 왼쪽으로 병합하는 함수
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
        rowScore += cell * 2; // 점수 추가
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

// 회전 각도 정의
const rotateDegreeMap: Record<Direction, 0 | 90 | 180 | 270> = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

// 회전 복원 각도 정의
const revertDegreeMap: Record<Direction, 0 | 90 | 180 | 270> = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};

// 게임 보드 생성 함수
const createBoard = (): Map2048 => {
  const board: Map2048 = Array.from(
    { length: 4 },
    (): Tile[] => Array(4).fill(null) as Tile[],
  );
  addRandomTile(board);
  addRandomTile(board);
  return board;
};

// 새로운 타일을 추가하는 함수
const addRandomTile = (board: Map2048): void => {
  const emptyTiles: { row: number; col: number }[] = [];

  // row가 정의되어 있고 배열인지 확인한 후 진행
  for (let row = 0; row < board.length; row++) {
    const currentRow = board[row]; // currentRow를 별도로 정의하여 명확하게 처리
    if (currentRow !== undefined && Array.isArray(currentRow)) {
      // board[row]가 undefined가 아니고 배열인지 확인
      for (let col = 0; col < currentRow.length; col++) {
        if (currentRow[col] === null) {
          // 타일이 null인지 확인
          emptyTiles.push({ row, col });
        }
      }
    }
  }

  // 빈 타일이 있는 경우 실행
  if (emptyTiles.length > 0) {
    const randomTile =
      emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

    // randomTile이 유효하고, 해당 row와 col이 배열 내에서 유효한지 확인
    if (
      randomTile !== undefined && // randomTile이 정의되었는지 확인
      randomTile.row >= 0 &&
      randomTile.row < board.length && // row가 유효한지 확인
      board[randomTile.row] !== undefined && // board[randomTile.row]가 undefined가 아닌지 확인
      Array.isArray(board[randomTile.row]) && // board[randomTile.row]가 배열인지 확인
      randomTile.col >= 0 &&
      randomTile.col < (board[randomTile.row] as Tile[]).length // col이 유효한지 확인
    ) {
      const currentRow = board[randomTile.row] as Tile[]; // currentRow를 명확하게 처리
      if (currentRow[randomTile.col] === null) {
        // 명확하게 null 체크
        currentRow[randomTile.col] = Math.random() > 0.5 ? 2 : 4; // 안전하게 타일에 값 할당
      }
    }
  }
};

// React 컴포넌트
const App: React.FC = () => {
  const [board, setBoard] = useState<Map2048>(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0); // 점수 상태 추가

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
  }, [board, gameOver]);

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
      <h2>점수: {score}</h2> {/* 점수 표시 */}
      {gameOver ? (
        <div>
          <h1>축하합니다! 128을 만드셨습니다!</h1>
        </div>
      ) : (
        <div>{renderBoard()}</div>
      )}
    </div>
  );
};

export default App;
