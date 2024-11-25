import React from 'react';

interface ControlsProps {
  onReset: () => void;
  onUndo: () => void;
  undoDisabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onReset,
  onUndo,
  undoDisabled,
}) => {
  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={onReset} style={{ padding: '10px' }}>
        다시하기
      </button>
      <button
        onClick={onUndo}
        style={{ marginLeft: '10px', padding: '10px' }}
        disabled={undoDisabled}
      >
        Undo
      </button>
    </div>
  );
};

export default Controls;
