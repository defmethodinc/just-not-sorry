var HighlightGenerator = window.HighlightGenerator = {};

HighlightGenerator.highlightMatches = function highlightMatches(message, warningClass) {
  return function (currMatch, rangeToHighlight) {
    var parentNode = this;
    var parentRect = parentNode.getBoundingClientRect();
    var rectsToHighlight = rangeToHighlight.getClientRects();
    for (var i = 0; i < rectsToHighlight.length; i++) {
      var highlightNode = HighlightGenerator.highlightMatch(rectsToHighlight[i], parentRect);
      highlightNode.title = message;
      highlightNode.className = warningClass;
      parentNode.appendChild(highlightNode);
    }
  }
};

HighlightGenerator.highlightMatch = function highlightMatch(rect, parentRect) {
  var highlightNode = HighlightGenerator.generateHighlightNode();
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  var scroll = {top: scrollTop, left: scrollLeft};
  var coords = HighlightGenerator.transformCoordinatesRelativeToParent(rect, parentRect, scroll);
  HighlightGenerator.setNodeStyle(highlightNode, rect, coords);
  return highlightNode;
};

HighlightGenerator.generateHighlightNode = function generateHighlightNode() {
  return document.createElement('div');
};

HighlightGenerator.transformCoordinatesRelativeToParent = function transformCoordinatesRelativeToParent(rect, parentRect, scroll) {
  var coords = {};
  if (document.location.hostname === 'inbox.google.com') {
    coords.top = (rect.top + scroll.top - parentRect.top + (rect.height * 0.9));
    coords.left = (rect.left + scroll.left - parentRect.left);
    return coords;
  } else if (document.location.hostname === 'mail.google.com') {
    coords.top = (rect.top + scroll.top - parentRect.top + (rect.height * 1.4));
    coords.left = ((rect.left * 1.01) + scroll.left - parentRect.left);
    return coords;
  } else {
    coords.top = (rect.top + scroll.top - parentRect.top + (rect.height * 1.4));
    coords.left = ((rect.left * 1.01) + scroll.left - parentRect.left);
    return coords;
  }
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
