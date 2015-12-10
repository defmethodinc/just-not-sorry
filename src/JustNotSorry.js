var gmail;
var warningChecker;

function refresh(f) {
  'use strict';
  if ((/in/.test(document.readyState)) || (window.jQuery === undefined) || (window.Gmail === undefined)) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

function checkForWarnings(compose, type) {
  'use strict';

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
  warningChecker = new WarningChecker({
    warnings: [
      { keyword: 'just',
        message: '"Just" demeans what you have to say. “Just” shrinks your power. It’s time to say goodbye to the justs. --Tara Sophia Mohr', },
      { keyword: 'actually',
        message: '"Actually" communicates a sense of surprise that you have something to say. Of course you want to add something. Of course you have questions. There’s nothing surprising about it.  --Tara Sophia Mohr', },
      { keyword: 'sorry',
        message: 'Using "sorry" frequently undermines your gravitas and makes you appear unfit for leadership. --Sylvia Ann Hewlett', },
      { keyword: 'apologize',
        message: 'Apologizing unnecessarily puts you in a subservient position and makes people lose respect for you --Bonnie Marcus', },
      { keyword: 'I think',
        message: '"I think" undermines your idea and displays an overall lack of self-confidence. --Lydia Dishman', },
      { keyword: 'I\'m no expert',
        message: '"I\'m no expert" undermines your idea and displays an overall lack of self-confidence. --Lydia Dishman', },
      { keyword: 'does that make sense',
        message: '"does that make sense" comes across either as condescending (like your audience can\'t understand) or it implies you feel you’ve been incoherent. A better way to close is something like "I look forward to hearing your thoughts." You can leave it up to the other party to let you know if they are confused about something, rather than implying that you "didn\'t make sense." --Tara Sophia Mohr', },
    ],
  });
  gmail.observe.on('compose', checkForWarnings);
  gmail.observe.before('send_message', cleanupWarnings);
};

refresh(main);
