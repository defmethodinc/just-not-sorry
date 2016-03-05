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
      if (e.target === body.get(0)) {
        warningChecker.addWarnings(body);
      }
    });
  }

  function removeWarningsOnFocusOut(compose) {
    var $target = compose.$el;
    $target.focusout(function(e) {
      var body = compose.dom('body');
      if (e.target === body.get(0)) {
        warningChecker.removeWarnings(body);
      }
    });
  }

  function updateWarningsOnMutation(compose) {
    var target = compose.$el.get(0);
    var observer = new MutationObserver(function() {
      var body = compose.dom('body');
      // MacOSX allows typing these modifiers for characters. See http://guides.macrumors.com/Typing_with_extended_characters
      var modifierCharacters = ["\u00A8", "\u02C6", "\u0384"];
      var caretPosition = body.caret('pos');
      // Do not run checker if user inputted one of these modifiers.
      if (caretPosition > 0 && !modifierCharacters.includes(body.text()[caretPosition-1])) {
        warningChecker.removeWarnings(body);
        warningChecker.addWarnings(body);
        body.caret('pos', caretPosition);
      }
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
