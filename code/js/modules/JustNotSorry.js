var $ = require('../libs/jquery');
require('../libs/jquery.caret');
var Gmail = require('../libs/gmail-0.4');
var gmail = new Gmail($);
var WARNINGS = require('./Warnings');
var WarningChecker = require('./WarningChecker');
var warningChecker = new WarningChecker(WARNINGS);

function checkForWarnings(compose) {
  'use strict';

  var observer = new MutationObserver(function() {
    var body = compose.dom('body');
    var caretPosition = body.caret('pos');
    warningChecker.removeWarnings(body);
    warningChecker.addWarnings(body);
    body.caret('pos', caretPosition);
  });

  var target = compose.$el.get(0);
  var config = {characterData: true, subtree: true};
  observer.observe(target, config);
}

function cleanupWarnings(url, body, data, xhr) {
  'use strict';
  var bodyParams = xhr.xhrParams.body_params;

  var oldCmml = xhr.xhrParams.url.cmml;

  var existingBody = bodyParams.body;
  var newBody = warningChecker.removeWarnings($(existingBody));

  if (newBody.length > oldCmml) {
    xhr.xhrParams.url.cmml = newBody.length;
  } else {
    newBody += '<div>';
    while (newBody.length < oldCmml) {
      newBody += ' ';
    }

    newBody += '</div>';
    xhr.xhrParams.url.cmml = newBody.length;
  }

  bodyParams.body = newBody;
}

module.exports.init = function() {
  'use strict';
  gmail.observe.on('compose', checkForWarnings);
  gmail.observe.before('send_message', cleanupWarnings);
};
