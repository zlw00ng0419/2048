import './styles/App.css';

import React from 'react';

import Board from './components/Board';
import Controls from './components/Controls';
import Score from './components/Score';
import useGame from './hooks/useGame';

const App: React.FC = () => {
  const { board, score, gameOver, resetGame, undoMove, prevBoard } = useGame();

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>128 게임</h1>
      <Score score={score} />
      {gameOver ? (
        <div>
          <h1>축하합니다! 128을 만드셨습니다!</h1>
          <Controls
            onReset={resetGame}
            onUndo={undoMove}
            undoDisabled={prevBoard === null}
          />
        </div>
      ) : (
        <div>
          <Board board={board} />
          <Controls
            onReset={resetGame}
            onUndo={undoMove}
            undoDisabled={prevBoard === null}
          />
        </div>
      )}
    </div>
  );
};

export default App;
