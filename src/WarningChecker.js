function WarningChecker(options) {
  options || (options = {});
  this.warnings = options.warnings || [];
  this.warningClass = options.warningClass || 'jns-warning';
}

WarningChecker.prototype.addWarning = function addWarning($content, keyword, message) {
  'use strict';
  var pattern = new RegExp('\\b(' + keyword + ')(?!($))\\b', 'ig');
  domRegexpMatch($content.get(0), pattern, HighlightGenerator.highlightMatches(message, this.warningClass));
};

WarningChecker.prototype.addWarnings = function addWarnings($content) {
  'use strict';
  var _this = this;
  $.each(_this.warnings, function(index, warning) {
    _this.addWarning($content, warning.keyword, warning.message);
  });
};

WarningChecker.prototype.removeWarnings = function removeWarnings($content) {
  'use strict';
  var $elementsToRemove = $content.find('div.' + this.warningClass);
  $elementsToRemove.remove();
};
