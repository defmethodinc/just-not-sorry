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

  function observeContentEditable() {
    console.log('observeContentEditable');
    var observer = new MutationObserver(function(mutations) {
      console.log('in mutation observer');
      mutations.forEach(function(mutation) {
        //var changedNode = mutation.target;
        var myNodeList = mutation.addedNodes;
        for (var i = 0; i < myNodeList.length; ++i) {
          var node = myNodeList[i];
          if (node.querySelectorAll) {
            var editableNodes = node.querySelectorAll('div[contentEditable=true]');
            if (editableNodes.length > 0) {
              console.log('mutation', mutation);
              console.log('node ' + i, node);
              console.log(editableNodes);
            }
          }
          //if (node.getAttribute('contentEditable')) {
          //  console.log('node ' + i, myNodeList[i]);
          //}
        }
      });
    });
    observer.observe(document, {childList: true, subtree: true});
  }

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

  //gmail = new Gmail();
  warningChecker = new WarningChecker(WARNINGS);
  //gmail.observe.on('compose', checkForWarnings);
  observeContentEditable();
};

JustNotSorry();
//refresh(JustNotSorry);
