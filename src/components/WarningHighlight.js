import React from 'react';
import { Tooltip } from 'react-tooltip';

const YPOS_ADJUSTMENT = 3;
function calculatePosition(container, bounds) {
  return {
    top: `${
        bounds.top + bounds.height - container.top - YPOS_ADJUSTMENT
    }px`,
    left: `${bounds.left - container.left}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height * 0.2}px`,
  };
}

export default function Highlight({ number, message, container, bounds }) {
  return (
      <div
          data-testid="jns-highlight"
          className="jns-highlight"
          data-tooltip-id={`jns-highlight-${number}`}
          style={calculatePosition(container, bounds)}
          data-tooltip-content={message}
      >
        <Tooltip
            className="jns-tooltip"
            id={`jns-highlight-${number}`}
            float={true}
        />
      </div>
  );
}
