import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

const YPOS_ADJUSTMENT = 3;

const calculatePosition = (coords) => {
  if (coords) return coords.top <= 200 ? 'bottom' : 'top';
  else return undefined;
};

export const getNodeStyle = (rect, coord) => {
  if (rect && coord) {
    return {
      style: {
        top: `${coord.top - YPOS_ADJUSTMENT}px`,
        left: `${coord.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height * 0.2}px`,
        zIndex: 10,
        position: 'absolute',
        padding: '0px',
      },
      position: calculatePosition(coord),
    };
  }
};

export const calculateCoords = (parentNode, rect) => {
  if (parentNode && rect) {
    const parentRect = parentNode.getBoundingClientRect();
    return {
      top: rect.top - parentRect.top + rect.height,
      left: rect.left - parentRect.left,
    };
  }
  return undefined;
};

export const highlightStyles = (parentNode, rangeToHighlight) => {
  if (parentNode && rangeToHighlight) {
    const rectsToHighlight = Array.from(rangeToHighlight.getClientRects());
    return rectsToHighlight.map((rect) =>
      getNodeStyle(rect, calculateCoords(parentNode, rect))
    );
  }
  return undefined;
};

export default function Warning(props) {
  const { parentNode, rangeToHighlight } = props.value;

  const highlights = highlightStyles(parentNode, rangeToHighlight);

  return (
    <div className="jns-warning">
      {highlights.map((highlight, index) => (
        <WarningHighlight
          key={index}
          styles={highlight.style}
          parent={parentNode}
          keyword={props.value.keyword}
          message={props.value.message}
          position={highlight.position}
        />
      ))}
    </div>
  );
}
