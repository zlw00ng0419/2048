import React from 'react';

import type { Map2048 } from '../utils/gameLogic';

interface BoardProps {
  board: Map2048;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <div>
      {board.map((row, rowIndex) => (
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
      ))}
    </div>
  );
};

export default Board;
