'use strict';

function setWarnings(target, fieldType) {
  warningChecker.removeWarnings(target)
  warningChecker.addWarnings(target, fieldType);
  ['focus', 'keydown'].forEach(function(event) {
    target.addEventListener(event, function() {
      warningChecker.addWarnings(target, fieldType);
    }, {once: true});
  });
}

function removeWarnings(target) {
  target.onblur = function() {
    warningChecker.removeWarnings(target);
  }
}

function checkForWarnings() {
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
        setWarnings(target, fieldType)
        removeWarnings(target)
      //Gmail
      } else if (target.getAttribute('aria-label') === 'Message Body') {
        var parentNode = mutation[0].target.parentNode;
        parentNode.childNodes.forEach((node) => {
          if (node.className === 'gmail_quote') {
            fieldType = 'forward';
            setWarnings(target, fieldType);
            removeWarnings(target);
          }
        });
        if (parentNode.nextSibling && fieldType != 'forward') {
          fieldType = 'reply';
          setWarnings(target, fieldType);
          removeWarnings(target);
        }
        if (fieldType != 'forward' && fieldType != 'reply') {
          fieldType = 'compose';
          setWarnings(target, fieldType);
          removeWarnings(target)
        }
      }
    }
  });
  observer.observe(document, {characterData: true, subtree: true});
}

var warningChecker = new WarningChecker(WARNINGS);
checkForWarnings();
