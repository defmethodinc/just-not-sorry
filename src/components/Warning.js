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
  const rects = props.rangeToHighlight.getClientRects();
  const warnings = [];
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];

    const coord = calculateCoords(props.parentBounds, rect);
    const highlight = getHighlight(rect, coord);

    warnings.push(
      <WarningHighlight
        message={props.message}
        position={highlight.position}
        styles={highlight.style}
        key={`${coord.top}x${coord.left}`}
      />
    );
  }
  return <div className="jns-warning">{warnings}</div>;
}
