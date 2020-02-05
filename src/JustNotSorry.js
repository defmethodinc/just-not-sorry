'use strict';

function removeWarningsOnBlur(target) {
  target.onblur = function() {
    warningChecker.removeWarnings(target);
  }
}

var warningChecker = new WarningChecker(WARNINGS);

var addTextEventListener = function(mutation) {
  ['focus', 'input'].forEach(function(action) {
    document.querySelector('div[contentEditable=true]').addEventListener(action, checkForWarnings(warningChecker, mutation))
  });
}

var removeTextEventListener = function() {
  ['focus', 'input'].forEach(function(action) {
    document.querySelector('div[contentEditable=true]').removeEventListener(action, checkForWarnings(warningChecker, action))
  });
}

var observer = new MutationObserver(function(mutation) {
  if (document.querySelector('div[contentEditable=true]')) {
    addTextEventListener(mutation);
    removeTextEventListener();
  }
});

function checkForWarnings(warningChecker, mutation) {
  var target
  target = document.querySelector('div[contentEditable=true]');

  document.querySelectorAll('div[contentEditable=true]').forEach((field) => {
    var active = document.activeElement;
    [field, active].reduce((a, b) => {
      if (a != b) {
        target = active;
      }
      if (target === null) {
        target = field;
      }
    });
  });

  warningChecker.removeWarnings(target.parentNode);
  warningChecker.addWarnings(target.parentNode);
  removeWarningsOnBlur(target.parentNode);
}

var loadObserver = setInterval(function() {
  var editableDiv = document.querySelector('div[contentEditable=true]');
  if (editableDiv != null) {
    clearInterval(loadObserver);
    observer.observe(editableDiv, {characterData: true, subtree: true, childList: true});
  }
}, 1000);
