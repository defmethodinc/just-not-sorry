function WarningChecker(options) {
  options || (options = {});
  this.warnings = options.warnings || [];
  this.warningClass = options.warningClass || 'jns-warning';
}

WarningChecker.prototype.addWarning = function addWarning(node, keyword, message) {
  'use strict';
  var pattern = new RegExp(keyword, 'ig');
  domRegexpMatch(node, pattern, HighlightGenerator.highlightMatches(message, this.warningClass));
};

WarningChecker.prototype.addWarnings = function addWarnings(node) {
  'use strict';
  var _this = this;
  this.warnings.forEach(function(warning) {
    _this.addWarning(node, warning.keyword, warning.message);
  });
};

WarningChecker.prototype.removeWarnings = function removeWarnings(node) {
  'use strict';
  var elementsToRemove = node.getElementsByClassName(this.warningClass);
  for (var i = elementsToRemove.length; i--;) {
    elementsToRemove[i].remove();
  }
};
