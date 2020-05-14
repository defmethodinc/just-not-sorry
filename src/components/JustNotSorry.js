import { Component } from 'preact';

import Warning from './Warning.js';
import * as Util from './util.js';
import { WARNING_MESSAGES } from './WarningMessages.js';

export var warningChecker = new WarningChecker(WARNING_MESSAGES);
export var WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;


class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      warnings: [{
        highlight: {},
        tooltip: {}
      }] // will be Warning objects
    }
    this.checkForWarnings = Util.debounce(
      this.checkForWarningsImpl,
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
    this.editableDivCount = 0;
    this.addObserver = this.addObserver.bind(this);
    this.removeObserver = this.removeObserver.bind(this);
    this.documentObserver = new MutationObserver(
      this.handleContentEditableDivChange.bind(this)
    );
    this.observer = new MutationObserver(
      this.handleContentEditableContentInsert.bind(this)
    );
    this.initialize();
  }

  initialize() {
    this.documentObserver.observe(document, { subtree: true, childList: true });
  }

  addObserver(event) {
    const element = event.currentTarget;
    this.handleWarnings = this.checkForWarnings.bind(element.parentNode);
    element.addEventListener('input', this.handleWarnings);
    warningChecker.addWarnings(element.parentNode);
    this.observer.observe(element, {
      characterData: false,
      subtree: true,
      childList: true,
      attributes: false,
    });
  }

  removeObserver(event) {
    const element = event.currentTarget;
    warningChecker.removeWarnings(element.parentNode);
    element.removeEventListener('input', this.handleWarnings);
    this.observer.disconnect();
  }

  checkForWarningsImpl() {
    const parentElement = this;
    warningChecker.removeWarnings(parentElement);
    warningChecker.addWarnings(parentElement);
  }

  applyEventListeners(id) {
    var targetDiv = document.getElementById(id);
    targetDiv.addEventListener('focus', this.addObserver.bind(this));
    targetDiv.addEventListener('blur', this.removeObserver.bind(this));
  }

  handleContentEditableDivChange(mutations) {
    var divCount = this.getEditableDivs().length;
    if (divCount !== this.editableDivCount) {
      this.editableDivCount = divCount;
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
  
  render() {
    return (
      <div class="jns">
        <Warning warning={this.state.warnings[0]} />
      </div>
    );
  }
}

// const justNotSorry = new JustNotSorry();

export default JustNotSorry;
