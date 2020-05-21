import { h } from 'preact';
import WarningTooltip from './WarningTooltip.js';

export default function Highlight() {
  return (
    <div
      className="jns-highlight"
      style={this.props.styles}
      data-tip={this.props.message}
    >
      <WarningTooltip />
    </div>
  );
}
