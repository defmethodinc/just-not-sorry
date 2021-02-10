import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNINGS from '../warnings/phrases.json';
import domRegexpMatch from 'dom-regexp-match';
import { handleContentEditableContentInsert } from '../callbacks/ContentEditableInsert';
import { handleContentEditableChange } from '../callbacks/ContentEditableChange';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const OPTIONS = {
  characterData: false,
  subtree: true,
  childList: true,
  attributes: false,
};

class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      warnings: [],
    };

    this.documentObserver = new MutationObserver(
      handleContentEditableChange(this.applyEventListeners)
    );
    this.documentObserver.observe(document, { subtree: true, childList: true });

    this.observer = new MutationObserver(handleContentEditableContentInsert);
  }

  updateWarnings = (node, pattern, message) => {
    domRegexpMatch(node, pattern, (match, range) => {
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
  };

  addWarning = (node, warning) =>
    this.updateWarnings(
      node,
      new RegExp(warning.pattern, 'ig'),
      warning.message
    );

  resetState = () => {
    // pass a function to ensure the call uses the updated version
    // eslint-disable-next-line no-unused-vars
    this.setState((state) => ({
      warnings: [],
    }));
  };

  addWarnings = (node) => {
    this.resetState();
    WARNINGS.forEach((warning) => this.addWarning(node, warning));
  };

  checkForWarnings = (node) =>
    Util.debounce(
      () => this.addWarnings(node),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );

  addObserver = (event) => {
    const node = event.currentTarget;
    this.addWarnings(node);
    this.observer.observe(node, OPTIONS);
    const warningCheck = this.checkForWarnings(node);
    node.addEventListener('focus', warningCheck);
    node.addEventListener('input', warningCheck);
  };

  removeObserver = (event) => {
    this.observer.disconnect();
    this.resetState();
    const node = event.currentTarget;
    node.removeEventListener('focus', this.addObserver);
    const warningCheck = this.checkForWarnings(node);
    node.removeEventListener('focus', warningCheck);
    node.removeEventListener('input', warningCheck);
  };

  applyEventListeners = (node) => {
    node.addEventListener('focus', this.addObserver);
    node.addEventListener('blur', this.removeObserver);
  };

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
