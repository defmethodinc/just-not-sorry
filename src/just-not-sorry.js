var gmail;

function refresh(f) {
  'use strict';
  if ((/in/.test(document.readyState)) || (Gmail === undefined)) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

function init(compose, type) {
  'use strict';
  console.log('api.dom.compose object:', compose, 'type is:', type);
  var wrapper = document.createElement('span');
  wrapper.className = 'just-sorry-warning';

  var observer = new MutationObserver(function() {
    var body = compose.dom('body').get(0);
    findAndReplaceDOMText(body, {
      find: / just /gi,
      wrap: wrapper,
      filterElements: function(el) {
        return !el.matches('span');
      },
    });
  });

  var config = {characterData: true, subtree: true};

  var target = compose.$el.get(0);
  observer.observe(target, config);
}

function removeWarning(str) {
  'use strict';
  return str.replace(/just-sorry-warning/gi, '');
}

function cleanup(url, body, data, xhr) {
  'use strict';
  var bodyParams = xhr.xhrParams.body_params;

  var oldCmml = xhr.xhrParams.url.cmml;

  var existingBody = bodyParams.body;
  var newBody = removeWarning(existingBody);

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
  gmail.observe.on('compose', init);
  gmail.observe.before('send_message', cleanup);
};

refresh(main);
