import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNINGS from '../warnings/phrases.json';
import domRegexpMatch from 'dom-regexp-match';

export const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const isContentEditableChildList = (mutation) =>
  mutation.type === 'childList' &&
  mutation.target.hasAttribute('contentEditable');

const isContentEditableCharacterData = (mutation) =>
  mutation.type !== 'characterData' &&
  mutation.target.hasAttribute('contentEditable');

const triggerCheckForWarnings = (mutation) =>
  mutation.target.dispatchEvent(
    new Event('input', { bubbles: true, cancelable: true })
  );

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

    this.observer = new MutationObserver(
      this.handleContentEditableContentInsert.bind(this)
    );
  }

  handleContentEditableDivChange = (mutations) =>
    mutations
      .filter(isContentEditableChildList)
      .forEach((mutation) => this.applyEventListeners(mutation.target));

  handleContentEditableContentInsert = (mutations) =>
    mutations
      .filter(isContentEditableCharacterData)
      .forEach(triggerCheckForWarnings);

  checkForWarningsImpl = (parentElement) => {
    this.setState({ warnings: [] });
    this.addWarnings(parentElement);
  };

  checkForWarnings(parentElement) {
    return Util.debounce(
      () => this.checkForWarningsImpl(parentElement),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  }

  addObserver(event) {
    const element = event.currentTarget;
    element.addEventListener(
      'input',
      this.checkForWarnings(element.parentNode)
    );
    this.addWarnings(element.parentNode);
    this.observer.observe(element, {
      characterData: false,
      subtree: true,
      childList: true,
      attributes: false,
    });
  }

  removeObserver(event) {
    const element = event.currentTarget;
    this.setState({ warnings: [] });
    element.removeEventListener('input', this.checkForWarnings);
    this.observer.disconnect();
  }

  applyEventListeners(targetDiv) {
    targetDiv.removeEventListener('focus', this.addObserver);
    targetDiv.addEventListener('focus', this.addObserver.bind(this));
    targetDiv.addEventListener('blur', this.removeObserver.bind(this));
  }

  addWarning = (node, warning) =>
    this.updateWarnings(
      node,
      new RegExp(warning.pattern, 'ig'),
      warning.message
    );

  addWarnings = (node) =>
    WARNINGS.forEach((warning) => this.addWarning(node, warning));

  updateWarnings(node, pattern, message) {
    domRegexpMatch(node, pattern, (match, range) => {
      let newWarning = {
        pattern: pattern.source,
        message: message,
        parentNode: node,
        rangeToHighlight: range,
      };

      this.setState((state) => {
        const warnings = state.warnings
          .concat(newWarning)
          .filter(
            (warning) =>
              warning.rangeToHighlight.startContainer &&
              warning.rangeToHighlight.startContainer.textContent !==
                newWarning.message
          );
        return {
          warnings,
        };
      });
    });
  }

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
