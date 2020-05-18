import { h, Component } from 'preact';
import ToolTip from 'react-portal-tooltip';

export default function WarningTooltip() {
    return (
        <ToolTip active={this.props.isTooltipActive} position="bottom" arrow="center" parent=".jns-highlight">
            <div>
              <p class='jns-tooltip-message'>{this.props.message}</p>
            </div>
        </ToolTip>
    );
}