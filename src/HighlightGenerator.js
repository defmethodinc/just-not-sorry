var HighlightGenerator = window.HighlightGenerator = {};

HighlightGenerator.highlightMatches = function highlightMatches(message, warningClass, fieldType) {
  return function (currMatch, rangeToHighlight) {
    var parentNode = this;
    var parentRect = parentNode.getBoundingClientRect();
    var rectsToHighlight = rangeToHighlight.getClientRects();

    for (var i = 0; i < rectsToHighlight.length; i++) {
      var highlightNode = HighlightGenerator.highlightMatch(rectsToHighlight[i], parentRect, fieldType);
      var messageNode = HighlightGenerator.generateHighlightNode();
      var scroll = HighlightGenerator.generateScroll();
      var coords = HighlightGenerator.transformCoordinatesRelativeToParent(rectsToHighlight[i], parentRect, scroll, fieldType);
      highlightNode.className = warningClass;
      highlightNode.setAttribute('triggerHeight', rectsToHighlight[i].height);
      highlightNode.style.zIndex = parentRect.height - coords.top;
      messageNode.className = "jns-message";
      messageNode.innerHTML = message;
      const offSet = 440; // Offset accounting for width of .jns-message and other padding/margins
      var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var messageRight = (rectsToHighlight[i].left + scroll.left) + offSet;
      if(messageRight > windowWidth) {
          messageNode.style.left = (windowWidth - messageRight) + 'px';
      }
      parentNode.appendChild(highlightNode).appendChild(messageNode);
    }
  }
};

HighlightGenerator.highlightMatch = function highlightMatch(rect, parentRect, fieldType) {
  var highlightNode = HighlightGenerator.generateHighlightNode();
  var scroll = HighlightGenerator.generateScroll();
  var coords = HighlightGenerator.transformCoordinatesRelativeToParent(rect, parentRect, scroll, fieldType);
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
  if (HighlightGenerator.getHostname() === 'inbox.google.com') {
    coords.top = (rect.top - parentRect.top + (rect.height * 0.6));
    coords.left = (rect.left + scroll.left - parentRect.left);
    return coords;
  } else if (HighlightGenerator.getHostname() === 'mail.google.com') {
    fieldType = fieldType + ' gmail';
    if (fieldType === 'compose gmail') {
      coords.top = (rect.top - parentRect.top + rect.height - 1);
      coords.left = (rect.left + scroll.left - parentRect.left + 1);
      return coords;
    } else if (fieldType === 'reply gmail') {
      coords.top = (rect.top - parentRect.top + (parentRect.height * 0.12));
      coords.left = (rect.left + scroll.left - parentRect.left);
      return coords;
    } else if (fieldType === 'forward gmail') {
      coords.top = (rect.top - parentRect.top + (parentRect.height * 0.02));
      coords.left = (rect.left + scroll.left - parentRect.left);
      return coords;
    }
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

HighlightGenerator.getHostname = function() {
  return document.location.hostname;
};