import React from 'react';

interface ScoreProps {
  score: number;
}

const Score: React.FC<ScoreProps> = ({ score }) => {
  return <h2>점수: {score}</h2>;
};

export default Score;
