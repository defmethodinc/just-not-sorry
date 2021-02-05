import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNINGS from '../warnings/phrases.json';
import domRegexpMatch from 'dom-regexp-match';
import { handleContentEditableContentInsert } from '../handlers/EditableContent';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 1;

const OPTIONS = {
  characterData: false,
  subtree: true,
  childList: true,
  attributes: false,
};

const isContentEditableChildList = (mutation) =>
  mutation.type === 'childList' &&
  mutation.target.hasAttribute('contentEditable');

class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      warnings: [],
    };

    this.documentObserver = new MutationObserver(
      this.handleContentEditableDivChange.bind(this)
    );
    this.documentObserver.observe(document, { subtree: true, childList: true });

    this.observer = new MutationObserver(handleContentEditableContentInsert);
  }

  updateWarnings = (node, pattern, message) => {
    if (node.childNodes) {
      node.childNodes.forEach((childNode) => {
        domRegexpMatch(childNode, pattern, (match, range) => {
          const newWarning = {
            pattern: pattern.source,
            message: message,
            parentNode: node.parentNode,
            rangeToHighlight: range,
          };

          this.setState((state) => ({
            warnings: state.warnings.concat(newWarning),
          }));
        });
      });
    }
  };

  addWarning = (node, warning) =>
    this.updateWarnings(
      node,
      new RegExp(warning.pattern, 'ig'),
      warning.message
    );

  addWarnings = (node) =>
    WARNINGS.forEach((warning) => this.addWarning(node, warning));

  checkForWarnings = (node) =>
    Util.debounce(() => {
      this.setState({ warnings: [] });
      this.addWarnings(node);
    }, WAIT_TIME_BEFORE_RECALC_WARNINGS);

  addObserver = (event) => {
    const node = event.currentTarget;
    node.addEventListener('input', this.checkForWarnings(node));
    this.addWarnings(node);
    this.observer.observe(node, OPTIONS);
  };

  removeObserver = (event) => {
    // pass a function to ensure the call uses the updated version
    // eslint-disable-next-line no-unused-vars
    this.setState((state) => ({
      warnings: [],
    }));
    event.currentTarget.removeEventListener('input', this.checkForWarnings);
    this.observer.disconnect();
  };

  applyEventListeners = (node) => {
    node.removeEventListener('focus', this.addObserver);
    node.addEventListener('focus', this.addObserver);
    node.addEventListener('blur', this.removeObserver);
  };

  handleContentEditableDivChange = (mutations) =>
    mutations
      .filter(isContentEditableChildList)
      .forEach((mutation) => this.applyEventListeners(mutation.target));

  render() {
    return (
      <div className="jns-warnings-list">
        {this.state.warnings.map((warning) =>
          ReactDOM.createPortal(
            <Warning key={warning.pattern} value={warning} />,
            warning.parentNode
          )
        )}
      </div>
    );
  }
}

export default JustNotSorry;
