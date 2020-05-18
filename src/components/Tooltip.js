import { h, Component } from 'preact';
import ToolTip from 'react-portal-tooltip';

class WarningTooltip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isTooltipActive: false
    }
  }

    showTooltip() {
        this.setState({isTooltipActive: true})
    }
    hideTooltip() {
        this.setState({isTooltipActive: false})
    }
    render() {
        return (
            <div>
                <p class="jns-tooltip-keyword" onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)}>{this.props.keyword}</p>
                <ToolTip active={this.state.isTooltipActive} position="bottom" arrow="center" parent=".jns-tooltip-keyword">
                    <div>
                      <p class='jns-tooltip-message'>{this.props.message}</p>
                    </div>
                </ToolTip>
            </div>
        )
    }
}

export default WarningTooltip;