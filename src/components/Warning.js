import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

const HIGHLIGHT_YPOS_ADJUSTMENT = 3;

export const calculateCoords = (parentNode, rangeToHighlight) => {
  if (parentNode && rangeToHighlight) {
    let parentRect = parentNode.getBoundingClientRect();
    let rectsToHighlight = rangeToHighlight.getClientRects();
    let rect = rectsToHighlight[0];
  
    if (rect) {
      let coords = {
        top: rect.top - parentRect.top + rect.height,
        left: rect.left - parentRect.left,
      };
      return coords;
    }
  }
  return
};

export const highlightStyles = (parentNode, rangeToHighlight) => {
  let coords = calculateCoords(parentNode, rangeToHighlight);
  let rectsToHighlight = rangeToHighlight.getClientRects();
  let rect = rectsToHighlight[0];

  if (rect) {
    return setNodeStyle(rect, coords);
  }
};

export const setNodeStyle = (rect, coords) => {
  return {
    top: coords.top - HIGHLIGHT_YPOS_ADJUSTMENT + 'px',
    left: coords.left + 'px',
    width: rect.width + 'px',
    height: rect.height * 0.2 + 'px',
    zIndex: 10,
    position: 'absolute',
    padding: '0px',
  };
};

export const calculatePosition = (coords) => {
  if (coords) {
    if (coords.top <= 200) {
      return 'bottom';
    } else if (coords.top > 200) {
      return 'top';
    }
  }
  return null;
};

export default function Warning(props) {
  const warningStyle = props.value
    ? highlightStyles(props.value.parentNode, props.value.rangeToHighlight)
    : {};
  const coords = props.value
    ? calculateCoords(props.value.parentNode, props.value.rangeToHighlight)
    : {};
  const position = calculatePosition(coords);

  return (
    <div className="jns-warning">
      <WarningHighlight
        styles={warningStyle}
        parent={props.value.parentNode}
        keyword={props.value.keyword}
        message={props.value.message}
        position={position}
      />
    </div>
  );
}
