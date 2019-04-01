'use strict';

function removeWarningsOnBlur(target) {
  target.onblur = function() {
    warningChecker.removeWarnings(target);
  }
}

var warningChecker = new WarningChecker(WARNINGS);

var addTextEventListener = function(mutation) {
  ['focus', 'input'].forEach(function(action) {
    document.querySelector('div[contentEditable=true]').addEventListener(action, checkForWarnings(warningChecker, mutation))
  });
}

var removeTextEventListener = function() {
  ['focus', 'input'].forEach(function(action) {
    document.querySelector('div[contentEditable=true]').removeEventListener(action, checkForWarnings(warningChecker, action))
  });
}

var observer = new MutationObserver(function(mutation) {
  if (document.querySelector('div[contentEditable=true]')) {
    addTextEventListener(mutation);
    removeTextEventListener();
  }
});

function checkForWarnings(warningChecker, mutation) {
  var target
  var fieldType;
  target = document.querySelector('div[contentEditable=true]');

  document.querySelectorAll('div[contentEditable=true]').forEach((field) => {
    var active = document.activeElement;
    [field, active].reduce((a, b) => {
      if (a != b) {
        target = active;
      }
      if (target === null) {
        target = field;
      }
    });
  });

  fieldType = null;
  // Inbox
  if (target.getAttribute('aria-label') === 'Reply' || target.getAttribute('aria-label') === 'Reply to all') {
    fieldType = 'reply';
  } else if (target.getAttribute('aria-label') === 'Body') {
    fieldType = 'compose';
  }
  //Gmail
  if (target.getAttribute('aria-label') === 'Message Body') {
    Array.from(target.children).forEach(function(child) {
      if (child.className ==='gmail_quote') {
        fieldType = 'forward';
      }
    });
    if (fieldType != 'forward' && target.nextSibling && target.nextSibling.className === 'aO8') {
      fieldType = 'reply';
    }
    if (fieldType != 'forward' && fieldType != 'reply') {
      fieldType = 'compose';
    }
  }
  warningChecker.removeWarnings(target.parentNode);
  warningChecker.addWarnings(target.parentNode, fieldType);
  removeWarningsOnBlur(target.parentNode);
}

function isNear(element, distance, event) {
  let left = element.offset().left - 2,
    top = element.offset().top - distance,
    right = left + element.width(),
    bottom = top + element.height() + distance,
    x = event.pageX,
    y = event.pageY;
  return (x > left && x < right && y > top && y < bottom);
};

function getYOffset(element){
  let yOffset = 20; // Set default
  try { yOffset = parseInt(element.getAttribute('triggerHeight')) } catch (err) {}
  return yOffset;
}

$('body').mousemove(function (e) {
 $('.jns-warning').each(function() {
    var yOffset = getYOffset($(this)[0]);
      if(isNear($(this), yOffset, event) ) {
        $(this).children('.jns-message').fadeIn();
      } else {
        $(this).children('.jns-message').fadeOut();     
      };
  });
});

observer.observe(document, {characterData: true, subtree: true})
