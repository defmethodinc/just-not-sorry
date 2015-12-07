function WarningChecker(warningMap) {
  if (!warningMap) {
    throw new Error('a warningMap of keywords to warningClasses must be provided');
  }

  this.warningMap = warningMap;
}

WarningChecker.prototype.addWarning = function addWarning($content, keyword, warningClass) {
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

WarningChecker.prototype.addWarnings = function addWarnings($content) {
  'use strict';
  var _this = this;
  $.each(_this.warningMap, function(keyword, warningClass) {
    _this.addWarning($content, keyword, warningClass);
  });

  return $content.html();
};

WarningChecker.prototype.removeWarning = function removeWarning($content, warningClass) {
  'use strict';
  var $elementsToRemove = $content.find('span.' + warningClass);
  $elementsToRemove.replaceWith(function() {
    return $(this).contents();
  });

  return $content.html();
};

WarningChecker.prototype.removeWarnings = function removeWarnings($content) {
  'use strict';
  var _this = this;
  $.each(_this.warningMap, function(keyword, warningClass) {
    _this.removeWarning($content, warningClass);
  });

  return $content.html();
};
