import React from 'react';
import { Tooltip } from 'react-tooltip';

export default function Highlight(props) {
  return (
    <div
      className="jns-highlight"
      style={props.styles}
      data-tooltip-content={props.message}
      data-tooltip-place={props.position}
      data-tooltip-position-strategy="fixed"
    >
      <Tooltip
        className="jns-tooltip"
        anchorSelect=".jns-highlight"
        float={true}
      />
    </div>
  );
}
