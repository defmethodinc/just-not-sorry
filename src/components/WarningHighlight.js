import React from 'react';
import WarningTooltip from './WarningTooltip.js';

export default function Highlight(props) {
  return (
    <div
      className="jns-highlight"
      style={props.styles}
      data-tip={props.message}
      data-place={props.position}
    >
      <WarningTooltip />
    </div>
  );
}
