import { Component } from 'preact';

import Highlight from './Highlight.js';
import Tooltip from './Tooltip.js';

class Warning extends Component {
  constructor(props) {
    super(props);
  }

  transformCoordinatesRelativeToParent(
    rect,
    parentRect
  ) {
    let coords = {};
    coords.top = rect.top - parentRect.top + rect.height;
    coords.left = rect.left - parentRect.left;
    return coords;
  }

  setNodeStyle(node, rect, coords) {
    node.style.top = coords.top - HIGHLIGHT_YPOS_ADJUSTMENT + 'px';
    node.style.left = coords.left + 'px';
    node.style.width = rect.width + 'px';
    node.style.height = rect.height * 0.2 + 'px';
    node.style.zIndex = 10;
    node.style.position = 'absolute';
    node.style.padding = '0px';
  }

  render() {
    return (
      <div class="jns-warning">
        <Highlight highlight={this.props.warning.highlight} />
        <Tooltip tooltip={this.props.warning.tooltip} />
      </div>
    );
  }
}

export default Warning;
