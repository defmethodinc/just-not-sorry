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
  var targets;
  var fieldType;
  var observer = new MutationObserver(function(mutation) {
    if (targets != document.querySelectorAll('div[contentEditable=true]')) {
      targets = document.querySelectorAll('div[contentEditable=true]');
      targets.forEach((target) => {
        if (target.getAttribute('aria-label') === 'Reply') {
          fieldType = 'reply';
          setWarnings(target, fieldType)
        } else {
          fieldType = 'compose';
          setWarnings(target, fieldType);
        }
      });
    } else {
      targets.forEach((target) => {
        setWarnings(target, fieldType);
        removeWarnings(target);
      });
    }
  });
  observer.observe(document, {characterData: true, subtree: true});
}

var warningChecker = new WarningChecker(WARNINGS);
checkForWarnings();
