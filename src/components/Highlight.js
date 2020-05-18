import { h, Component } from 'preact';
import ToolTip from 'react-portal-tooltip';

class Highlight extends Component {
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

  render(){
    return (
      <div
        class='jns-highlight'
        style={this.props.styles}
        onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)}
      >
        <ToolTip active={this.state.isTooltipActive} position="bottom" arrow="center" parent=".jns-highlight">
            <div>
              <p class='jns-tooltip-message'>{this.props.message}</p>
            </div>
        </ToolTip>
      </div>
    );
  }
}

export default Highlight;