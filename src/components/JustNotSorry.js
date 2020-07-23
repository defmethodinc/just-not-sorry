import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNING_MESSAGES from './WarningMessages.json';
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

  handleContentEditableContentInsert(mutations) {
    if (mutations[0]) {
      mutations.forEach((mutation) => {
        if (
          mutation.type !== 'characterData' &&
          mutation.target.hasAttribute('contentEditable')
        ) {
          let id = mutation.target.id;
          if (id) {
            let targetDiv = document.getElementById(id);
            // generate input event to fire checkForWarnings again
            let inputEvent = new Event('input', {
              bubbles: true,
              cancelable: true,
            });
            targetDiv.dispatchEvent(inputEvent);
          }
        }
      });
    }
  }

  handleContentEditableDivChange(mutations) {
    let divCount = this.getEditableDivs().length;
    if (divCount !== this.state.editableDivCount) {
      this.setState({ editableDivCount: divCount });
      if (mutations[0]) {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'childList' &&
            mutation.target.hasAttribute('contentEditable')
          ) {
            let id = mutation.target.id;
            if (id) {
              this.applyEventListeners(id);
            }
          }
        });
      }
    }
  }

  checkForWarnings(parentElement) {
    return Util.debounce(
      () => this.checkForWarningsImpl(parentElement),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  }

  checkForWarningsImpl(parentElement) {
    this.setState({ warnings: [] });
    this.addWarnings(parentElement);
  }

  applyEventListeners(id) {
    let targetDiv = document.getElementById(id);
    targetDiv.removeEventListener('focus', this.addObserver);
    targetDiv.addEventListener('focus', this.addObserver.bind(this));
    targetDiv.addEventListener('blur', this.removeObserver.bind(this));
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

  getEditableDivs() {
    return document.querySelectorAll('div[contentEditable=true]');
  }

  addWarning(node, keyword, message) {
    const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
    domRegexpMatch(node, pattern, (match, range) => {
      let newWarning = {
        keyword: keyword,
        message: message,
        parentNode: node,
        rangeToHighlight: range,
      };

      this.setState((state) => {
        let warnings = state.warnings;
        warnings = state.warnings.concat(newWarning).filter(function (warning) {
          if (warning.rangeToHighlight.startContainer) {
            return (
              warning.rangeToHighlight.startContainer.textContent !=
              newWarning.message
            );
          }
        });
        return {
          warnings,
        };
      });
    });
  }

  addWarnings(node) {
    WARNING_MESSAGES.map((warning) => {
      this.addWarning(node, warning.keyword, warning.message);
    });
  }

  render() {
    const warningList = this.state.warnings.map((warning) =>
      ReactDOM.createPortal(
        <Warning class=".jns-warning" key={warning.keyword} value={warning} />,
        warning.parentNode
      )
    );

    return <div className=".jns-warnings-list">{warningList}</div>;
  }
}

export default JustNotSorry;
