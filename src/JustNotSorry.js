var JustNotSorry = function() {
  'use strict';
  var warningChecker;

  function addWarningsOnFocusIn(target) {
    ['focus', 'keydown'].forEach(function(event) {
      target.addEventListener(event, function() {
        warningChecker.addWarnings(target);
      }, {once: true});
    });
  }

  function removeWarningsOnFocusOut(target) {
    target.onblur = function() {
      warningChecker.removeWarnings(target);
    }
  }

  function checkForWarnings() {
    var target;
    var observer = new MutationObserver(function(mutation) {
      if (!target) {
        target = document.querySelector('div[contentEditable=true]');
        addWarningsOnFocusIn(target);
      } else {
        addWarningsOnFocusIn(target);
        removeWarningsOnFocusOut(target);
      }
    });
    observer.observe(document, {characterData: true, subtree: true});
  }

  warningChecker = new WarningChecker(WARNINGS);
  checkForWarnings();
};

JustNotSorry();
