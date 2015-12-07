var gmail;
var warningChecker;

function refresh(f) {
  'use strict';
  if ((/in/.test(document.readyState)) || (Gmail === undefined)) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

function checkForWarnings(compose, type) {
  'use strict';
  console.log('api.dom.compose object:', compose, 'type is:', type);

  var observer = new MutationObserver(function() {
    var body = compose.dom('body');
    warningChecker.addWarnings(body);
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

var main = function() {
  'use strict';
  gmail = new Gmail();
  console.log('Hello,', gmail.get.user_email());
  warningChecker = new WarningChecker({
    just: 'jns-warning',
    actually: 'jns-warning',
    sorry: 'jns-warning',
    apologize: 'jns-warning',
  });
  gmail.observe.on('compose', checkForWarnings);
  gmail.observe.before('send_message', cleanupWarnings);
};

refresh(main);
