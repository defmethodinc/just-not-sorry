import { h, Component } from 'preact';

import Warning from './Warning.js';
import * as Util from './util.js';
import { WARNING_MESSAGES } from './WarningMessages.js';

import domRegexpMatch from 'dom-regexp-match';

export var WARNING_CLASS = 'jns-warning';
export var WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;


class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editableDivCount: 0,
      warnings: []
    }

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

  addObserver(event) {
    const element = event.currentTarget;
    element.addEventListener('input', this.checkForWarnings(element.parentNode));
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
    this.removeWarnings(element.parentNode);
    element.removeEventListener('input', this.checkForWarnings);
    this.observer.disconnect();
  }
  
  checkForWarnings(parentElement) {
    return Util.debounce(
      () => this.checkForWarningsImpl(parentElement),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  }

  checkForWarningsImpl(parentElement) {
    this.removeWarnings(parentElement);
    this.addWarnings(parentElement);
  }

  applyEventListeners(id) {
    var targetDiv = document.getElementById(id);
    targetDiv.addEventListener('focus', this.addObserver.bind(this));
    targetDiv.addEventListener('blur', this.removeObserver.bind(this));
  }

  handleContentEditableDivChange(mutations) {
    var divCount = this.getEditableDivs().length;
    if (divCount !== this.state.editableDivCount) {
      this.state.editableDivCount = divCount;
      if (mutations[0]) {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'childList' &&
            mutation.target.hasAttribute('contentEditable')
          ) {
            var id = mutation.target.id;
            if (id) {
              this.applyEventListeners(id);
            }
          }
        });
      }
    }
  }

  handleContentEditableContentInsert(mutations) {
    if (mutations[0]) {
      mutations.forEach((mutation) => {
        if (
          mutation.type !== 'characterData' &&
          mutation.target.hasAttribute('contentEditable')
        ) {
          var id = mutation.target.id;
          if (id) {
            var targetDiv = document.getElementById(id);
            // generate input event to fire checkForWarnings again
            var inputEvent = new Event('input', {
              bubbles: true,
              cancelable: true,
            });
            targetDiv.dispatchEvent(inputEvent);
          }
        }
      });
    }
  }

  getEditableDivs() {
    return document.querySelectorAll('div[contentEditable=true]');
  }

  addWarning(node, keyword, message) {
    const warningClass = WARNING_CLASS;
    const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
    domRegexpMatch(node, pattern, (match, range) => {
      let newWarning = {
        keyword: keyword,
        message: message,
        parentNode: node,
        rangeToHighlight: range,
      }

      this.setState(prevState => ({
        warnings: [...prevState.warnings, newWarning]
        }))
      });
    };

  addWarnings(node) {
    WARNING_MESSAGES.warnings.map((warning) => {
      this.addWarning(node, warning.keyword, warning.message);
    });
  }

  removeWarnings() {
    this.setState({
      warnings: []
    });
  }
  
  render() {
    const warningList = this.state.warnings.map((warning) =>
      <Warning key={warning.keyword}
               value={warning} />
    );

    return (
      <div class="jns">
        {warningList}
      </div>
    );
  }
}

export default JustNotSorry;
