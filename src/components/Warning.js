import React from 'react';
import WarningHighlight from './WarningHighlight.js';

const YPOS_ADJUSTMENT = 3;
export function calculateCoords(parentRect, rect) {
  return parentRect && rect
    ? {
        top: rect.top - parentRect.top + rect.height,
        left: rect.left - parentRect.left,
      }
    : undefined;
}

export function getHighlight(rect, coord) {
  return rect && coord
    ? {
        style: {
          top: `${coord.top - YPOS_ADJUSTMENT}px`,
          left: `${coord.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height * 0.2}px`,
          position: 'absolute',
          padding: '0px',
        },
        position: coord.top <= 200 ? 'bottom' : 'top',
      }
    : undefined;
}

export default function Warning(props) {
  const rects = props.range.getClientRects();
  return (
    <div data-testid="jns-warning" className="jns-warning">
      {Array.from(rects, (rect, index) => {
        const highlight = getHighlight(
          rect,
          calculateCoords(props.textArea, rect)
        );
        return (
          <WarningHighlight
            number={props.number + index * 10}
            message={props.message}
            position={highlight.position}
            styles={highlight.style}
            key={index}
          />
        );
      })}
    </div>
  );
}
