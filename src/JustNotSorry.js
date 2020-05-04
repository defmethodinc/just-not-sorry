'use strict';

import WarningChecker from './WarningChecker.js';
import WARNINGS from './Warnings.js';

var warningChecker = new WarningChecker(WARNINGS);
var editableDivCount = 0;
var WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

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

export var observer = new MutationObserver(function (mutations) {
  if (mutations[0]) {
    mutations.forEach(function (mutation) {
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
});

export var addObserver = function () {
  this.addEventListener('input', checkForWarnings);
  warningChecker.addWarnings(this.parentNode);
  observer.observe(this, {
    characterData: false,
    subtree: true,
    childList: true,
    attributes: false,
  });
};

export var removeObserver = function () {
  warningChecker.removeWarnings(this.parentNode);
  this.removeEventListener('input', checkForWarnings);
  observer.disconnect();
};

export var checkForWarnings = debounce(function () {
  warningChecker.removeWarnings(this.parentNode);
  warningChecker.addWarnings(this.parentNode);
}, WAIT_TIME_BEFORE_RECALC_WARNINGS);

var applyEventListeners = function (id) {
  var targetDiv = document.getElementById(id);
  targetDiv.addEventListener('focus', addObserver);
  targetDiv.addEventListener('blur', removeObserver);
};

var documentObserver = new MutationObserver(function (mutations) {
  var divCount = getEditableDivs().length;
  if (divCount !== editableDivCount) {
    editableDivCount = divCount;
    if (mutations[0]) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === 'childList' &&
          mutation.target.hasAttribute('contentEditable')
        ) {
          var id = mutation.target.id;
          if (id) {
            applyEventListeners(id);
          }
        }
      });
    }
  }
});

export function getEditableDivs() {
  return document.querySelectorAll('div[contentEditable=true]');
}

documentObserver.observe(document, { subtree: true, childList: true });
