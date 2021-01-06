import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNING_MESSAGES from './WarningMessages.json';
import WARNING_PUNCTUATIONS from './WarningPunctuations.json';
import domRegexpMatch from 'dom-regexp-match';

export const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editableDivCount: 0,
      warnings: [],
    };

    this.documentObserver = new MutationObserver(
      this.handleContentEditableDivChange.bind(this)
    );
    this.observer = new MutationObserver(
      this.handleContentEditableContentInsert.bind(this)
    );
    this.initializeObserver();
  }

  initializeObserver() {
    this.documentObserver.observe(document, { subtree: true, childList: true });
  }

  handleContentEditableDivChange(mutations) {
    let divCount = this.getEditableDivs().length;
    if (divCount !== this.state.editableDivCount) {
      this.setState({ editableDivCount: divCount });
      if (mutations[0]) {
        mutations
          .filter(
            (mutation) =>
              mutation.type === 'childList' &&
              mutation.target.hasAttribute('contentEditable')
          )
          .forEach((mutation) => this.applyEventListeners(mutation.target));
      }
    }
  }

  handleContentEditableContentInsert(mutations) {
    if (mutations[0]) {
      mutations
        .filter(
          (mutation) =>
            mutation.type !== 'characterData' &&
            mutation.target.hasAttribute('contentEditable')
        )
        .forEach((mutation) => {
          // generate input event to fire checkForWarnings again
          let inputEvent = new Event('input', {
            bubbles: true,
            cancelable: true,
          });
          mutation.target.dispatchEvent(inputEvent);
        });
    }
  }

  checkForWarningsImpl(parentElement) {
    this.setState({ warnings: [] });
    this.addWarnings(parentElement);
  }

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

  getEditableDivs() {
    return document.querySelectorAll('div[contentEditable=true]');
  }

  addWarning(node, keyword, message) {
    const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
    this.updateWarnings(node, pattern, keyword, message);
  }

  addPunctuationWarning(node, keyword, message) {
    const pattern = new RegExp('\\b(' + keyword + ')\\B', 'ig');
    this.updateWarnings(node, pattern, keyword, message);
  }

  addWarnings(node) {
    WARNING_MESSAGES.map((warning) => {
      this.addWarning(node, warning.keyword, warning.message);
    });
    WARNING_PUNCTUATIONS.map((warning) => {
      this.addPunctuationWarning(node, warning.keyword, warning.message);
    });
  }

  updateWarnings(node, pattern, keyword, message) {
    domRegexpMatch(node, pattern, (match, range) => {
      let newWarning = {
        keyword: keyword,
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
    const warningList = this.state.warnings.map((warning) =>
      ReactDOM.createPortal(
        <Warning
          className=".jns-warning"
          key={warning.keyword}
          value={warning}
        />,
        warning.parentNode
      )
    );

    return <div className=".jns-warnings-list">{warningList}</div>;
  }
}

export default JustNotSorry;
