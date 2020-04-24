function WarningChecker(options) {
  options || (options = {});
  this.warnings = options.warnings || [];
  this.warningClass = options.warningClass || 'jns-warning';
}

WarningChecker.prototype.addWarning = function addWarning(node, keyword, message) {
  'use strict';
  var pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
  var promises = [];
  var warningClass = this.warningClass;
  var promisifiedMatchCallback = function(match, range) {
    var matchPromise = HighlightGenerator.highlightMatches(message, warningClass).call(node, match, range);
    promises.push(matchPromise);
  }
  domRegexpMatch(node, pattern, promisifiedMatchCallback);
  return Promise.all(promises);
};

WarningChecker.prototype.addWarnings = function addWarnings(node) {
  'use strict';
  var _this = this;
  return Promise.all(this.warnings.map(function(warning) {
    return _this.addWarning(node, warning.keyword, warning.message);
  }));
};

WarningChecker.prototype.removeWarnings = function removeWarnings(node) {
  'use strict';
  var elementsToRemove = document.getElementsByClassName(this.warningClass);
  return myFastdom.mutate(function () {
    for (var i = elementsToRemove.length; i--;) {
      node.removeChild(elementsToRemove[i]);
    }
  });
};
