function WarningChecker(options) {
  options || (options = {});
  this.warnings = options.warnings || [];
  this.warningClass = options.warningClass || 'jns-warning';
}

WarningChecker.prototype.addWarning = function addWarning(node, keyword, message, fieldType) {
  'use strict';
  var pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
  domRegexpMatch(node, pattern, HighlightGenerator.highlightMatches(message, this.warningClass, fieldType));
};

WarningChecker.prototype.addWarnings = function addWarnings(node, fieldType) {
  'use strict';
  var _this = this;
  this.warnings.forEach(function(warning) {
    _this.addWarning(node, warning.keyword, warning.message, fieldType);
  });
};

WarningChecker.prototype.removeWarnings = function removeWarnings(node) {
  'use strict';
  var elementsToRemove = document.getElementsByClassName(this.warningClass);
  for (var i = elementsToRemove.length; i--;) {
    elementsToRemove[i].remove();
  }
};
