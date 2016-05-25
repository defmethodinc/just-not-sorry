var HighlightGenerator = window.HighlightGenerator = {};
var stop = false;
HighlightGenerator.highlightMatches = function highlightMatches(message, warningClass, warn) {
  return function(currMatch, rangeToHighlight) {
    var $range = window.$(rangeToHighlight.startContainer);
    if ($range.parents().hasClass('chrome-jns-highlight')) return;
    var fragment = rangeToHighlight.extractContents();
    var $span = window.$('<e class="chrome-jns-highlight"></e>');
    $span.append(fragment);
    $span.hover(function(evt) {
      var clientRect = evt.target.getBoundingClientRect();
      window.chromePopup.toggle(true)
        .setContent(warn)
        .setPosition(evt.pageX, evt.pageY + $span.height());
    }, function() {
      window.chromePopup.toggle(false);
    });
    rangeToHighlight.insertNode($span[0]);
  };
};

HighlightGenerator.highlightMatch = function highlightMatch(rect, parentRect) {
  var highlightNode = HighlightGenerator.generateHighlightNode();
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  var scroll = {
    top: scrollTop,
    left: scrollLeft
  };
  var coords = HighlightGenerator.transformCoordinatesRelativeToParent(rect, parentRect, scroll);
  HighlightGenerator.setNodeStyle(highlightNode, rect, coords);
  return highlightNode;
};

HighlightGenerator.generateHighlightNode = function generateHighlightNode() {
  return document.createElement('div');
};

HighlightGenerator.transformCoordinatesRelativeToParent = function transformCoordinatesRelativeToParent(rect, parentRect, scroll) {
  var coords = {};
  coords.top = (rect.top + scroll.top - parentRect.top + (rect.height * 0.9));
  coords.left = (rect.left + scroll.left - parentRect.left);
  return coords;
};

HighlightGenerator.setNodeStyle = function positionNode(node, rect, coords) {
  node.style.top = coords.top + 'px';
  node.style.left = coords.left + 'px';
  node.style.width = (rect.width) + 'px';
  node.style.height = (rect.height * 0.25) + 'px';
  node.style.zIndex = 10;
  node.style.position = 'absolute';
  node.style.padding = '0px';
};