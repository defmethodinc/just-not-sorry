function refresh(f) {
  'use strict';
  if ((/loading/.test(document.readyState)) ||
      (window.jQuery === undefined) ||
      (window.Gmail === undefined) ||
      (window.WARNINGS === undefined)) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

var JustNotSorry = function() {
  'use strict';
  var gmail;
  var warningChecker;

  function addWarningsOnFocusIn(compose, observer) {
    var $target = compose.$el;
    $target.focusin(function(e) {
      var body = compose.dom('body');
      if (e.target === body.get(0)) {
        warningChecker.addWarnings(body);
        observer.observe(target, {characterData: true, subtree: true});
      }
    });
  }

  function removeWarningsOnFocusOut(compose, observer) {
    var $target = compose.$el;
    $target.focusout(function(e) {
      var body = compose.dom('body');
      if (e.target === body.get(0)) {
        observer.disconnect();
        warningChecker.removeWarnings(body);
      }
    });
  }

  function createObserverForWarningsOnMutation() {
    return new MutationObserver(function() {
      var body = compose.dom('body');
      var caretPosition = body.caret('pos');
      warningChecker.removeWarnings(body);
      warningChecker.addWarnings(body);
      body.caret('pos', caretPosition);
    });
  }

  function checkForWarnings(compose) {
    var observer = createObserverForWarningsOnMutation();
    removeWarningsOnFocusOut(compose, observer);
    updateWarningsOnMutation(compose, observer);
  }

  gmail = new Gmail();
  warningChecker = new WarningChecker(WARNINGS);
  gmail.observe.on('compose', checkForWarnings);
};

refresh(JustNotSorry);
