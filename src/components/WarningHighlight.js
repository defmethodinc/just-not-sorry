import { h } from 'preact';
import WarningTooltip from './WarningTooltip.js';

export default function Highlight(props) {
  return (
    <div
      className="jns-highlight"
      style={props.styles}
      data-tooltip-content={props.message}
      data-tooltip-place={props.position}
    >
      <WarningTooltip />
    </div>
  );
}
