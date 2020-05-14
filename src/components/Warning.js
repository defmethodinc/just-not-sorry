import { Component } from 'preact';

import Highlight from './Highlight.js';
import Tooltip from './Tooltip.js';

// import domRegexpMatch from 'dom-regexp-match';

class Warning extends Component {
  constructor(props) {
    super(props);
    // this.warnings = props.warnings || [];
    // this.warningClass = props.warningClass || 'jns-warning';
  }

  // addWarning(node, keyword, message) {
  //   const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
  //   const promises = [];
  //   const warningClass = this.warningClass;
  //   const promisifiedMatchCallback = (match, range) => {
  //     const matchPromise = HighlightGenerator.highlightMatches(
  //       message,
  //       warningClass,
  //       node
  //     ).call(node, match, range);
  //     promises.push(matchPromise);
  //   };
  //   domRegexpMatch(node, pattern, promisifiedMatchCallback);
  //   return Promise.all(promises);
  // }

  // addWarnings(node) {
  //   return Promise.all(
  //     this.warnings.map((warning) => {
  //       return this.addWarning(node, warning.keyword, warning.message);
  //     })
  //   );
  // }

  // removeWarnings(node) {
  //   const elementsToRemove = document.getElementsByClassName(this.warningClass);
  //   return myFastdom.mutate(() => {
  //     for (var i = elementsToRemove.length; i--; ) {
  //       node.removeChild(elementsToRemove[i]);
  //     }
  //   });
  // }

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
