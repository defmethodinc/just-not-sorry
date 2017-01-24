'use strict';

function setWarnings(target) {
  warningChecker.removeWarnings(target);
  warningChecker.addWarnings(target);
  ['focus', 'keydown'].forEach(function(event) {
    target.addEventListener(event, function() {
      warningChecker.addWarnings(target);
    }, {once: true});
  });
}

function removeWarnings(target) {
  target.onblur = function() {
    warningChecker.removeWarnings(target);
  }
}

function checkForWarnings() {
  var target;
  var observer = new MutationObserver(function(mutation) {
    if (!target) {
      target = document.querySelector('div[contentEditable=true]');
      setWarnings(target);
    } else {
      setWarnings(target);
      removeWarnings(target);
    }
  });
  observer.observe(document, {characterData: true, subtree: true});
}

var warningChecker = new WarningChecker(WARNINGS);
checkForWarnings();
