import { h } from 'preact';
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
          zIndex: 10,
          position: 'absolute',
          padding: '0px',
        },
        position: coord.top <= 200 ? 'bottom' : 'top',
      }
    : undefined;
}

export default function Warning(props) {
  const parentBounds = props.container.getBoundingClientRect();
  const rects = props.rangeToHighlight.getClientRects();
  return (
    <div className="jns-warning">
      {Array.from(rects, (rect, index) => {
        const highlight = getHighlight(
          rect,
          calculateCoords(parentBounds, rect)
        );
        return (
          <WarningHighlight
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
