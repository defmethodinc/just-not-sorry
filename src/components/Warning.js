import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

export const HIGHLIGHT_YPOS_ADJUSTMENT = 3;

export const calculateCoords = (parentNode, rangeToHighlight) => {
  if (parentNode && rangeToHighlight) {
    const parentRect = parentNode.getBoundingClientRect();
    const rectsToHighlight = rangeToHighlight.getClientRects();
    return Array.from(rectsToHighlight).map((rect) => ({
      top: rect.top - parentRect.top + rect.height,
      left: rect.left - parentRect.left,
    }));
  }
  return undefined;
};

export const highlightStyles = (coords, rectsToHighlight) => {
  if (coords && rectsToHighlight) {
    return Array.from(rectsToHighlight).map((rect, i) =>
      getNodeStyle(rect, coords[i])
    );
  }
  return undefined;
};

export const getNodeStyle = (rect, coords) => {
  if (rect && coords) {
    return {
      top: `${coords.top - HIGHLIGHT_YPOS_ADJUSTMENT}px`,
      left: `${coords.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height * 0.2}px`,
      zIndex: 10,
      position: 'absolute',
      padding: '0px',
    };
  }
};

export const calculatePosition = (coords) => {
  if (coords) return coords.top <= 200 ? 'bottom' : 'top';
  else return undefined;
};

export default function Warning(props) {
  const { parentNode, rangeToHighlight } = props.value;

  const coords = calculateCoords(parentNode, rangeToHighlight);
  const rectsToHighlight = rangeToHighlight
    ? rangeToHighlight.getClientRects()
    : undefined;

  const warningStyles = highlightStyles(coords, rectsToHighlight);

  const highlights = warningStyles.map((style, index) => {
    const position = calculatePosition(coords[index]);
    return (
      <WarningHighlight
        key={index}
        styles={style}
        parent={parentNode}
        keyword={props.value.keyword}
        message={props.value.message}
        position={position}
      />
    );
  });
  return <div className="jns-warning">{highlights}</div>;
}
