import { h, Component } from 'preact';
import WarningTooltip from "./WarningTooltip.js";

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
        <WarningTooltip message={this.props.message} isTooltipActive={this.state.isTooltipActive} />
      </div>
    );
  }
}

export default Highlight;