function WarningChecker() {

}

WarningChecker.prototype.addWarning = function addWarning(
  $content,
  keyword,
  warningClass) {
  'use strict';
  if (new RegExp(keyword).test(warningClass)) {
    throw new Error('warningClass cannot contain the keyword because the RegExp will be too complex');
  }

  var wrapper = document.createElement('span');
  wrapper.className = warningClass;

  var pattern = new RegExp('\\b(' + keyword + ')(?!($))\\b', 'ig');
  findAndReplaceDOMText($content.get(0), {
    preset: 'prose',
    find: pattern,
    wrap: wrapper,
    filterElements: function(el) {
      return !el.matches('span.' + warningClass);
    },
  });
  return $content.html();
};
