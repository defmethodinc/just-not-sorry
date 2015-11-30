function WarningChecker() {

}

WarningChecker.prototype.addWarning = function addWarning(
  content,
  keyword,
  warningClass) {
  'use strict';
  var warningStart = '<span class="' + warningClass + '">';
  var pattern = new RegExp('(' + warningStart + ')?\\b(' + keyword + ')\\b(</span>)?', 'ig');
  return content.replace(pattern, function(match) {
    // debugger;
    if (new RegExp(warningStart).test(match)) {
      return match;
    } else {
      return warningStart + match + '<\/span>';
    }
  });
};
