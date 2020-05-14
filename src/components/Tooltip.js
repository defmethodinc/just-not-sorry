import { Component } from 'preact';

class Tooltip extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <div class='jns-tooltip'>{this.props.tooltip}</div>;
  }
}

export default Tooltip;