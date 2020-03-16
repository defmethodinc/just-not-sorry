var HighlightGenerator = window.HighlightGenerator = {};
const HIGHLIGHT_YPOS_ADJUSTMENT = 3;
const MESSAGE_OFFSET = 440; // Offset accounting for width of .jns-message and other padding/margins

HighlightGenerator.highlightMatches = function highlightMatches(message, warningClass) {
  return function (currMatch, rangeToHighlight) {
    var parentNode = this;
    var parentRect = parentNode.getBoundingClientRect();
    var rectsToHighlight = rangeToHighlight.getClientRects();
    for (var i = 0; i < rectsToHighlight.length; i++) {
      var highlightNode = HighlightGenerator.highlightMatch(rectsToHighlight[i], parentRect);
      var messageNode = HighlightGenerator.generateHighlightNode();
      var scroll = HighlightGenerator.generateScroll();
      var coords = HighlightGenerator.transformCoordinatesRelativeToParent(rectsToHighlight[i], parentRect);
      highlightNode.className = warningClass;
      highlightNode.setAttribute('triggerHeight', rectsToHighlight[i].height);
      highlightNode.style.zIndex = parentRect.height - coords.top + 200;
      messageNode.className = "jns-message";
      messageNode.innerHTML = message;
      var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var messageRight = (rectsToHighlight[i].left + scroll.left) + MESSAGE_OFFSET;
      if(messageRight > windowWidth) {
          messageNode.style.left = (windowWidth - messageRight) + 'px';
      }
      parentNode.appendChild(highlightNode).appendChild(messageNode);
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

HighlightGenerator.generateScroll = function generateScroll() {
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    return {top: scrollTop, left: scrollLeft};
};

HighlightGenerator.transformCoordinatesRelativeToParent = function transformCoordinatesRelativeToParent(rect, parentRect, scroll, fieldType) {
  var coords = {};
  coords.top = (rect.top - parentRect.top + rect.height);
  coords.left = (rect.left - parentRect.left);
  return coords;
};

HighlightGenerator.setNodeStyle = function positionNode(node, rect, coords) {
  node.style.top = (coords.top - HIGHLIGHT_YPOS_ADJUSTMENT) + 'px';
  node.style.left = coords.left + 'px';
  node.style.width = (rect.width) + 'px';
  node.style.height = (rect.height * 0.2) + 'px';
  node.style.zIndex = 10;
  node.style.position = 'absolute';
  node.style.padding = '0px';
};
