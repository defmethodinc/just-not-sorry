function WarningChecker() {

}

WarningChecker.prototype.addWarning = function addWarning(
  content,
  keyword,
  warningClass) {
  'use strict';
  if (new RegExp(keyword).test(warningClass)) {
    throw new Error('warningClass cannot contain the keyword because the RegExp will be too complex');
  }

  var warningStart = '<span class="' + warningClass + '">';
  var pattern = new RegExp('(' + warningStart + ')?\\b(' + keyword + ')\\b(</span>)?', 'ig');
  return content.replace(pattern, function(match) {
    if (new RegExp(warningStart).test(match)) {
      return match;
    } else {
      return warningStart + match + '<\/span>';
    }
  });
};
