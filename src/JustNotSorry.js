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
  var isFocused = true;

  function addWarningsOnFocusIn(compose) {
    var $target = compose.$el;
    var listener = function(e) {
      isFocused = true;
      var body = compose.dom('body');
      var editor = body.parent();
      if (e.target === body.get(0)) {
        warningChecker.addWarnings(editor);
      }
    };
    $target.focusin(listener);
    $target.keyup(listener);
  }

  function removeWarningsOnFocusOut(compose) {
    var $target = compose.$el;
    $target.focusout(function(e) {
      isFocused = false;
      var body = compose.dom('body');
      var editor = body.parent();
      if (e.target === body.get(0)) {
        warningChecker.removeWarnings(editor);
      }
    });
  }

  function updateWarningsOnMutation(compose) {
    var target = compose.$el.get(0);
    var timer = 0;
    var observer = new MutationObserver(function(mutations) {
      var body = compose.dom('body');
      var editor = body.parent();
      if (editor.hasClass('chrome-jst-busy')) return;
      warningChecker.removeWarnings(editor);
      warningChecker.addWarnings(editor);
    });
    observer.observe(target, {
      characterData: true,
      subtree: false
    });
  }

  function checkForWarnings(compose) {
    addWarningsOnFocusIn(compose);
    removeWarningsOnFocusOut(compose);
    updateWarningsOnMutation(compose);
  }
  if (location.hostname === 'localhost') return;
  gmail = new Gmail(window.jQuery);
  warningChecker = new WarningChecker(WARNINGS);
  gmail.observe.on('compose', checkForWarnings);
};

refresh(JustNotSorry);