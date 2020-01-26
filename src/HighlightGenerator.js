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
  var coords = HighlightGenerator.transformCoordinatesRelativeToParent(rect, parentRect);
  HighlightGenerator.setNodeStyle(highlightNode, rect, coords);
  return highlightNode;
};

HighlightGenerator.generateHighlightNode = function generateHighlightNode() {
  return document.createElement('div');
};

HighlightGenerator.transformCoordinatesRelativeToParent = function transformCoordinatesRelativeToParent(rect, parentRect, scroll, fieldType) {
  var coords = {};
  coords.top = (rect.top - parentRect.top + rect.height);
  coords.left = (rect.left - parentRect.left);
  return coords;
};

HighlightGenerator.setNodeStyle = function positionNode(node, rect, coords) {
  node.style.top = coords.top + 'px';
  node.style.left = coords.left + 'px';
  node.style.width = (rect.width) + 'px';
  node.style.height = (rect.height * 0.2) + 'px';
  node.style.zIndex = 10;
  node.style.position = 'absolute';
  node.style.padding = '0px';
};
