var gmail;

function refresh(f) {
  if( (/in/.test(document.readyState)) || (undefined === Gmail) ) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

function init(compose, type) {
  console.log('api.dom.compose object:', compose, 'type is:', type );
  var wrapper = document.createElement('span');
  wrapper.className = 'just-sorry-warning';

  var observer = new MutationObserver(function(mutations) {
    var body = compose.dom('body').get(0);
    findAndReplaceDOMText(body, {
      find: / just /gi,
      wrap: wrapper,
      filterElements: function(el) {
        return !el.matches("span");
      }
    });
  });

  var config = { characterData: true, subtree: true };

  var target = compose.$el.get(0);
  observer.observe(target, config);
}

function cleanup(url, body, data, xhr) {
  var body_params = xhr.xhrParams.body_params;

  var oldCmml = xhr.xhrParams.url.cmml;

  var existing_body = body_params.body;
  var new_body = removeWarning(existing_body);

  if (new_body.length > oldCmml) {
      xhr.xhrParams.url.cmml = new_body.length;
  } else {
      new_body += '<div>';
      while(new_body.length<oldCmml){
          new_body += ' ';
      }
      new_body += '</div>';
      xhr.xhrParams.url.cmml = new_body.length;
  }
  body_params.body = new_body;
}

function removeWarning(str) {
  return str.replace(/just-sorry-warning/gi, "");
}

var bodyIncludesKeywords = function () {
  return true;
}

var main = function(){
  gmail = new Gmail();
  console.log('Hello,', gmail.get.user_email());
  gmail.observe.on('compose', init);
  gmail.observe.before('send_message', cleanup);
}

refresh(main);
