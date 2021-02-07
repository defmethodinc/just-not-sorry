import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

const YPOS_ADJUSTMENT = 3;

export const calculateCoords = (parentNode, rectsToHighlight) => {
  if (parentNode && rectsToHighlight) {
    const parentRect = parentNode.getBoundingClientRect();
    return rectsToHighlight.map((rect) => ({
      top: rect.top - parentRect.top + rect.height,
      left: rect.left - parentRect.left,
    }));
  }
  return undefined;
};

export const highlightStyles = (coords, rectsToHighlight) => {
  if (coords && rectsToHighlight) {
    return rectsToHighlight.map((rect, i) => getNodeStyle(rect, coords[i]));
  }
  return undefined;
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

const calculatePosition = (coords) => {
  if (coords) return coords.top <= 200 ? 'bottom' : 'top';
  else return undefined;
};

export default function Warning(props) {
  const { parentNode, rangeToHighlight } = props.value;

  const rectsToHighlight = rangeToHighlight
    ? Array.from(rangeToHighlight.getClientRects())
    : [];

  const coords = calculateCoords(parentNode, rectsToHighlight);
  const highlights = highlightStyles(coords, rectsToHighlight);

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
