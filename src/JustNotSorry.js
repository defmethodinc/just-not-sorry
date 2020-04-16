'use strict';

var warningChecker = new WarningChecker(WARNINGS);
var editableDivCount = 0;

var observer = new MutationObserver(function(mutations) {
  if (mutations[0]) {
    mutations.forEach(function(mutation) {
      if (mutation.type !== 'characterData' && mutation.target.hasAttribute('contentEditable')) {
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

var addObserver = function() {
  warningChecker.addWarnings(this.parentNode);
  observer.observe(this, {characterData: true, subtree: true, childList: true,  attributes: true});
};

var removeObserver = function() {
  warningChecker.removeWarnings(this.parentNode);
  observer.disconnect();
};

var checkForWarnings = function() {
  warningChecker.removeWarnings(this.parentNode);
  warningChecker.addWarnings(this.parentNode);
};

var applyEventListeners = function(id) {
  var targetDiv = document.getElementById(id);
  targetDiv.addEventListener('focus', addObserver);
  targetDiv.addEventListener('input', checkForWarnings);
  targetDiv.addEventListener('blur', removeObserver);
};

var documentObserver = new MutationObserver(function(mutations) {
  var divCount = getEditableDivs().length;
  if (divCount !== editableDivCount) {
    editableDivCount = divCount;
    var id;
    if (mutations[0]) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.target.hasAttribute('contentEditable')) {
          id = mutation.target.id;
          if (id) {
            applyEventListeners(id);
          }
        }
      });
    }
  }
});

function getEditableDivs() {
  return document.querySelectorAll('div[contentEditable=true]');
}

documentObserver.observe(document, {subtree: true, childList: true});
