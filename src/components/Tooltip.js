import { h, Component } from 'preact';

function Tooltip(props) {
  return (
    <div class='jns-tooltip'>
      <div class='jns-tooltip-keyword'>{props.keyword}</div>
      <div class='jns-tooltip-message'>{props.message}</div>
    </div>
  );
}

export default Tooltip;