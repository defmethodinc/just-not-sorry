import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

export class HighlightHelper {
  static YPOS_ADJUSTMENT = 3;
  static calculateCoords(parentRect, rect) {
    return parentRect && rect
      ? {
          top: rect.top - parentRect.top + rect.height,
          left: rect.left - parentRect.left,
        }
      : undefined;
  }

  static getHighlight(rect, coord) {
    return rect && coord
      ? {
          style: {
            top: `${coord.top - this.YPOS_ADJUSTMENT}px`,
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

  static getHighlights(parentNode, rangeToHighlight) {
    if (parentNode && rangeToHighlight) {
      const parentRect = parentNode.getBoundingClientRect();
      return Array.from(rangeToHighlight.getClientRects(), (rect) =>
        this.getHighlight(rect, this.calculateCoords(parentRect, rect))
      );
    }
    return undefined;
  }
}

export default function Warning(props) {
  const { parentNode, rangeToHighlight } = props.value;

  const highlights = HighlightHelper.getHighlights(
    parentNode,
    rangeToHighlight
  );

  return (
    <div className="jns-warning">
      {highlights.map((highlight, index) => (
        <WarningHighlight
          key={index}
          styles={highlight.style}
          message={props.value.message}
          position={highlight.position}
        />
      ))}
    </div>
  );
}
