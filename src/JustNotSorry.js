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
  var fieldType;
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

  fieldType = null;
  // Inbox
  if (target.getAttribute('aria-label') === 'Reply' || target.getAttribute('aria-label') === 'Reply to all') {
    fieldType = 'reply';
  } else if (target.getAttribute('aria-label') === 'Body') {
    fieldType = 'compose';
  }
  //Gmail
  if (target.getAttribute('aria-label') === 'Message Body') {
    Array.from(target.children).forEach(function(child) {
      if (child.className ==='gmail_quote') {
        fieldType = 'forward';
      }
    });
    if (fieldType != 'forward' && target.nextSibling && target.nextSibling.className === 'aO8') {
      fieldType = 'reply';
    }
    if (fieldType != 'forward' && fieldType != 'reply') {
      fieldType = 'compose';
    }
  }
  warningChecker.removeWarnings(target.parentNode);
  warningChecker.addWarnings(target.parentNode, fieldType);
  removeWarningsOnBlur(target.parentNode);
}

observer.observe(document, {characterData: true, subtree: true})
