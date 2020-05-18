import { h, Component } from 'preact';

import Highlight from './Highlight.js';

const HIGHLIGHT_YPOS_ADJUSTMENT = 3;

class Warning extends Component {
  constructor(props) {
    super(props);
  }

  highlightStyles() {
    let parentRect = this.props.value.parentNode.getBoundingClientRect();
    let rectsToHighlight = this.props.value.rangeToHighlight.getClientRects();

    let coords = this.transformCoordinatesRelativeToParent(
      rectsToHighlight[0],
      parentRect
    );
    return this.setNodeStyle(rectsToHighlight[0], coords);
  }

  transformCoordinatesRelativeToParent(
    rect,
    parentRect
  ) {
    let coords = {};
    coords.top = parentRect.top + rect.height + 10;
    coords.left = parentRect.left;
    return coords;
  }

  setNodeStyle(rect, coords) {
    return {
      top: coords.top - HIGHLIGHT_YPOS_ADJUSTMENT + 'px',
      left: coords.left + 'px',
      width: rect.width + 'px',
      height: rect.height * 0.2 + 'px',
      zIndex: 10,
      position: 'absolute',
      padding: '0px',
    }
  }

  render() {
    return (
      <div class="jns-warning">
        <Highlight 
          styles={this.highlightStyles()} 
          parent={this.props.value.parentNode} 
          keyword={this.props.value.keyword} 
          message={this.props.value.message} />
      </div>
    );
  }
}

export default Warning;
