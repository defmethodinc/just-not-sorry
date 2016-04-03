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

  function addWarningsOnFocusIn(compose) {
    var $target = compose.$el;
    $target.focusin(function(e) {
      var body = compose.dom('body');
      var editor = body.parent();
      if (e.target === body.get(0)) {
        warningChecker.addWarnings(editor);
      }
    });
  }

  function removeWarningsOnFocusOut(compose) {
    var $target = compose.$el;
    $target.focusout(function(e) {
      var body = compose.dom('body');
      var editor = body.parent();
      if (e.target === body.get(0)) {
        warningChecker.removeWarnings(editor);
      }
    });
  }

  function updateWarningsOnMutation(compose) {
    var target = compose.$el.get(0);
    var observer = new MutationObserver(function() {
      var body = compose.dom('body');
      var editor = body.parent();
      warningChecker.removeWarnings(editor);
      warningChecker.addWarnings(editor);
    });
    observer.observe(target, {characterData: true, subtree: true});
  }

  function checkForWarnings(compose) {
    addWarningsOnFocusIn(compose);
    removeWarningsOnFocusOut(compose);
    updateWarningsOnMutation(compose);
  }

  gmail = new Gmail();
  warningChecker = new WarningChecker(WARNINGS);
  gmail.observe.on('compose', checkForWarnings);
};

refresh(JustNotSorry);
