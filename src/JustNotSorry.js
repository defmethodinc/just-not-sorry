'use strict';

function removeWarningsOnBlur(target) {
  target.onblur = function() {
    warningChecker.removeWarnings(target);
  }
}

function checkForWarnings(warningChecker) {
  var target
  var fieldType;
  var observer = new MutationObserver(function(mutation) {
    target = null;
    document.querySelectorAll('div[contentEditable=true]').forEach((field) => {
      [field, document.activeElement].reduce((a, b) => {
        if (a != b) {
          target = document.activeElement;
        }
        if (target === null) {
          target = field;
        }
      });
    });
    if (target) {
      fieldType = null;
      // Inbox
      if (target.getAttribute('aria-label') === 'Reply') {
        fieldType = 'reply';
      } else if (target.getAttribute('aria-label') === 'Body') {
        fieldType = 'compose';
      //Gmail
      } else if (target.getAttribute('aria-label') === 'Message Body') {
        var parentNode = mutation[0].target.parentNode;
        parentNode.childNodes.forEach((node) => {
          if (node.className === 'gmail_quote') {
            fieldType = 'forward';
          }
        });
        if ((parentNode.parentNode.nextSibling && parentNode.parentNode.nextSibling.className === 'aO8' && fieldType != 'forward') || (parentNode.nextSibling && parentNode.nextSibling.className === 'aO8' && fieldType != 'forward')) {
          fieldType = 'reply';
        }
        if (fieldType != 'forward' && fieldType != 'reply') {
          fieldType = 'compose';
        }
      }
      warningChecker.removeWarnings(target);
      warningChecker.addWarnings(target, fieldType);
      removeWarningsOnBlur(target);
    }
  });
  observer.observe(document, {characterData: true, subtree: true});
}

var warningChecker = new WarningChecker(WARNINGS);
checkForWarnings(warningChecker);
