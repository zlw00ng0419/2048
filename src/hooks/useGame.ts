import { useEffect, useState } from 'react';

import {
  addRandomTile,
  createBoard,
  type Map2048,
  moveMapIn2048Rule,
} from '../utils/gameLogic';

const useGame = () => {
  const [board, setBoard] = useState<Map2048>(createBoard);
  const [prevBoard, setPrevBoard] = useState<Map2048 | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);

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

  return { board, score, gameOver, resetGame, undoMove, prevBoard };
};

export default useGame;
