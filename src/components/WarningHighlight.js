import React from 'react';
import { Tooltip } from 'react-tooltip';

export default function Highlight(props) {
  return (
    <div
      data-testid="jns-highlight"
      className="jns-highlight"
      data-tooltip-id={`jns-highlight-${props.number}`}
      style={props.styles}
      data-tooltip-content={props.message}
    >
      <Tooltip
        className="jns-tooltip"
        id={`jns-highlight-${props.number}`}
        float={true}
      />
    </div>
  );
}
