import { h, Component } from 'preact';
import WarningTooltip from "./WarningTooltip.js";

export default function Highlight() {
  return (
    <div
      class='jns-highlight'
      style={this.props.styles}
      data-tip={this.props.message}
    >
    <WarningTooltip/>
    </div>
  );
}
