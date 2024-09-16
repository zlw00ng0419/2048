import './App.css';

import React, { useEffect,useState } from 'react';

type Tile = number | null;

const createBoard = (): Tile[][] => {
  const board: Tile[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  addRandomTile(board);
  addRandomTile(board);
  return board;
};

const addRandomTile = (board: Tile[][]): void => {
  const emptyTiles: { row: number; col: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col]) {
        emptyTiles.push({ row, col });
      }
    }
  }
  if (emptyTiles.length > 0) {
    const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board[row][col] = Math.random() > 0.5 ? 2 : 4;
  }
};

const isNotNull = (tile: Tile | null): tile is Tile => tile !== null;

const slideRow = (row: (Tile | null)[]): (Tile | null)[] => {
  const newRow = row.filter(isNotNull);
  while (newRow.length < 4) {
    newRow.push(null);
  }
  return newRow;
};

const combineRow = (row: (Tile | null)[]): (Tile | null)[] => {
  for (let i = 0; i < 3; i++) {
    if (row[i] !== null && row[i] === row[i + 1]) {
      row[i] = row[i]! * 2;
      row[i + 1] = null;
    }
  }
  return row;
};

const moveTiles = (board: Tile[][], moveFn: (row: Tile[]) => Tile[]): { newBoard: Tile[][], moved: boolean } => {
  let moved = false;
  const newBoard: Tile[][] = board.map(row => {
    const originalRow = [...row];
    const newRow = moveFn([...row]);

    if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
      moved = true;
    }

    return newRow;
  });

  return { newBoard, moved };
};

const moveLeft = (board: Tile[][]): { newBoard: Tile[][], moved: boolean } => {
  return moveTiles(board, row => {
    let newRow = slideRow(row);
    newRow = combineRow(newRow);
    return slideRow(newRow);
  });
};

const moveRight = (board: Tile[][]): { newBoard: Tile[][], moved: boolean } => {
  return moveTiles(board, row => {
    const newRow = slideRow([...row].reverse());
    const combinedRow = combineRow(newRow);
    return slideRow(combinedRow).reverse();
  });
};

const rotateLeft = (board: Tile[][]): Tile[][] => {
  const rotatedBoard = Array(4).fill(null).map(() => Array(4).fill(null));
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      rotatedBoard[3 - col][row] = board[row][col];
    }
  }
  return rotatedBoard;
};

const rotateRight = (board: Tile[][]): Tile[][] => {
  const rotatedBoard = Array(4).fill(null).map(() => Array(4).fill(null));
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      rotatedBoard[col][3 - row] = board[row][col];
    }
  }
  return rotatedBoard;
};

const moveUp = (board: Tile[][]): { newBoard: Tile[][], moved: boolean } => {
  const rotatedBoard = rotateLeft(board);
  const { newBoard, moved } = moveLeft(rotatedBoard);
  return { newBoard: rotateRight(newBoard), moved };
};

const moveDown = (board: Tile[][]): { newBoard: Tile[][], moved: boolean } => {
  const rotatedBoard = rotateRight(board);
  const { newBoard, moved } = moveLeft(rotatedBoard);
  return { newBoard: rotateLeft(newBoard), moved };
};

const App: React.FC = () => {
  const [board, setBoard] = useState<Tile[][]>(createBoard);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver) return;

      let newBoardState = { newBoard: board, moved: false };
      if (event.key === 'ArrowUp') {
        newBoardState = moveUp(board);
      } else if (event.key === 'ArrowDown') {
        newBoardState = moveDown(board);
      } else if (event.key === 'ArrowLeft') {
        newBoardState = moveLeft(board);
      } else if (event.key === 'ArrowRight') {
        newBoardState = moveRight(board);
      }

      if (newBoardState.moved) {
        addRandomTile(newBoardState.newBoard);
        setBoard(newBoardState.newBoard);

        if (newBoardState.newBoard.flat().includes(128)) {
          setGameOver(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
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
              backgroundColor: tile ? 'lightgray' : 'white',
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
      {gameOver ? (
        <div>
          <h1>축하합니다! 128을 만드셨습니다!</h1>
        </div>
      ) : (
        <div>
          <h1>128 게임</h1>
          {renderBoard()}
        </div>
      )}
    </div>
  );
};

export default App;
