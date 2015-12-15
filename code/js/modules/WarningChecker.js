var $ = require('../libs/jquery-2.1.4');
var findAndReplaceDOMText = require('../lib/findAndReplaceDOMText');

module.exports.WarningChecker = function WarningChecker(options) {
  options || (options = {});
  this.warnings = options.warnings || [];
  this.warningClass = options.warningClass || 'jns-warning';
};

WarningChecker.prototype.addWarning = function addWarning($content, keyword, warningClass, message) {
  'use strict';
  if (new RegExp(keyword).test(warningClass)) {
    throw new Error('warningClass cannot contain the keyword because the RegExp will be too complex');
  }

  var wrapper = document.createElement('span');
  wrapper.className = warningClass;
  if (message) {
    wrapper.title = message;
  }

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
  $.each(_this.warnings, function(index, warning) {
    _this.addWarning($content, warning.keyword, _this.warningClass, warning.message);
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
  this.removeWarning($content, this.warningClass);

  return $content.html();
};
