import { h } from 'preact';

import WarningHighlight from './WarningHighlight.js';

const HIGHLIGHT_YPOS_ADJUSTMENT = 3;

export default function Warning(props) {
  const highlightStyles = () => {
    let parentRect = props.value.parentNode.getBoundingClientRect();
    let rectsToHighlight = props.value.rangeToHighlight.getClientRects();
    let rect = rectsToHighlight[0];

    if (rect) {
      let coords = {
        top: rect.top - parentRect.top + rect.height,
        left: rect.left - parentRect.left,
      };

      return setNodeStyle(rect, coords);
    }
  };

  const setNodeStyle = (rect, coords) => {
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

  return (
    <div className="jns-warning">
      <WarningHighlight
        styles={highlightStyles()}
        parent={props.value.parentNode}
        keyword={props.value.keyword}
        message={props.value.message}
      />
    </div>
  );
}
