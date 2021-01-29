import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

export const HIGHLIGHT_YPOS_ADJUSTMENT = 3;

export const calculateCoords = (parentNode, rangeToHighlight) => {
  if (parentNode && rangeToHighlight) {
    const parentRect = parentNode.getBoundingClientRect();
    const rectsToHighlight = rangeToHighlight.getClientRects();

    const coords = [];
    for (let i = 0; i < rectsToHighlight.length; i++) {
      const rect = rectsToHighlight[i];
      coords.push({
        top: rect.top - parentRect.top + rect.height,
        left: rect.left - parentRect.left,
      });
    }
    return coords;
  }
  return undefined;
};

export const highlightStyles = (parentNode, rangeToHighlight) => {
  if (parentNode && rangeToHighlight) {
    const coords = calculateCoords(parentNode, rangeToHighlight);
    const rectsToHighlight = rangeToHighlight.getClientRects();
    const styles = [];
    for (let i = 0; i < rectsToHighlight.length; i++) {
      styles.push(getNodeStyle(rectsToHighlight[i], coords[i]));
    }
    return styles;
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
  const warningStyles = highlightStyles(parentNode, rangeToHighlight);
  const coords = calculateCoords(parentNode, rangeToHighlight);
  const positions = calculatePosition(coords);

  const highlights = warningStyles.map((style, index) => (
    <WarningHighlight
      key={positions[index]}
      styles={style}
      parent={parentNode}
      keyword={props.value.keyword}
      message={props.value.message}
      position={positions[index]}
    />
  ));
  return <div className="jns-warning">{highlights}</div>;
}
