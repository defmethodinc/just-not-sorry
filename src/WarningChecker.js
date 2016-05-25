function WarningChecker(options) {
  options || (options = {});
  this.warnings = options.warnings || [];
  this.warningClass = options.warningClass || 'jns-warning';
}

WarningChecker.prototype.addWarning = function addWarning($content, keyword, message, warn) {
  'use strict';
  var pattern = new RegExp('\\b(' + keyword + ')(?!($))\\b', 'ig');
  domRegexpMatch($content.get(0), pattern, HighlightGenerator.highlightMatches(message, this.warningClass, warn));
};

WarningChecker.prototype.getCursorPosition = function addWarnings($content) {
  var sel = document.getSelection();
};

WarningChecker.prototype.addWarnings = function addWarnings($content) {
  'use strict';
  var _this = this;
  this.hasWarnings = true;
  window.$content = $content;
  _this.getCursorPosition($content);
  $.each(_this.warnings, function(index, warning) {
    _this.addWarning($content, warning.keyword, warning.message, warning);
  });

};

WarningChecker.prototype.removeWarnings = function removeWarnings($content) {
  'use strict';
  if (!this.hasWarnings) return;
  var elementsToRemove = $content.find('e.chrome-jns-highlight');
  elementsToRemove.each(function() {
    var elm = this,
      parent = elm.parentElement,
      textNode = elm.firstChild;
    parent.replaceChild(textNode, elm);

  });
  window.chromePopup.toggle(false);
};