'use strict';

import WarningChecker from './WarningChecker.js';
import { WARNINGS } from './Warnings.js';

export var warningChecker = new WarningChecker(WARNINGS);
export var WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

// from underscore.js
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class JustNotSorry {
  constructor() {
    this.checkForWarnings = debounce(
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
}

const justNotSorry = new JustNotSorry();

export default justNotSorry;
