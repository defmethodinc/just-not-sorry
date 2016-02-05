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
        // warningChecker.addWarnings(body);
      }
    });
  }

  function removeWarningsOnFocusOut(compose) {
    var $target = compose.$el;
    $target.focusout(function(e) {
      var body = compose.dom('body');
      if (e.target === body.get(0)) {
        // warningChecker.removeWarnings(body);
      }
    });
  }

  // div highlight needs to scroll with email text
  // div highlight should pass-through mouse clicks
  // hover over div highlight should display tooltip
  // Expand MutationObserver to handle increased font sizes

  // all the same words should be supported
  // add and remove in the same way
  // remove caretPosition code

  function updateWarningsOnMutation(compose) {
    var target = compose.$el.get(0);
    var observer = new MutationObserver(function() {
      var body = compose.dom('body');
      var textToFind = "I'm sorry that I went home";
      if (body.text().includes(textToFind)) {
        var range = document.createRange();
        var index = body.text().indexOf(textToFind);
        // debugger;
        var bodyNode = body.get(0);
        var child = bodyNode.firstChild;
        range.setStart(child, index);
        range.setEnd(child, index+(textToFind.length));
        var rects = range.getClientRects();
        for (var i = 0; i != rects.length; i++) {
	        var rect = rects[i];
          drawBox(rect, bodyNode.parentNode);
        }
      }
      // var caretPosition = body.caret('pos');
      // warningChecker.removeWarnings(body);
      // warningChecker.addWarnings(body);
      // body.caret('pos', caretPosition);
    });
    observer.observe(target, {characterData: true, subtree: true});
  }

  function drawBox(rect, parentNode) {
    var parentRect = parentNode.getBoundingClientRect();

    var tableRectDiv = document.createElement('div');
    tableRectDiv.id = 'steve-test';
    tableRectDiv.className = 'jns-warning';
    tableRectDiv.title = 'This is a test';
    tableRectDiv.style.position = 'absolute';
    // tableRectDiv.style.pointerEvents = 'none';

    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    tableRectDiv.style.margin = tableRectDiv.style.padding = '0';
    tableRectDiv.style.top = (rect.top + scrollTop - parentRect.top + rect.height*0.9) + 'px';
    tableRectDiv.style.left = (rect.left + scrollLeft - parentRect.left) + 'px';
    tableRectDiv.style.width = (rect.width) + 'px';
    tableRectDiv.style.height = (rect.height*0.25) + 'px';
    tableRectDiv.style.zIndex = 10;
    parentNode.appendChild(tableRectDiv);
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
