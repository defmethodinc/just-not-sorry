import React from 'react';
import WarningHighlight from './WarningHighlight.js';

export default function Warning(props) {
  if (!props.textArea) {
    return;
  }
  const clientRects = props.range.getClientRects();
  const highlights = [];
  for (let i = 0; i < clientRects.length; i++) {
    const number = props.number + i * 10;
    highlights.push(
      <WarningHighlight
        key={number}
        number={number}
        message={props.message}
        container={props.textArea}
        bounds={clientRects[i]}
      />
    );
  }
  return <div data-testid="jns-warning">{highlights}</div>;
}
