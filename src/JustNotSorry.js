'use strict';

var warningChecker = new WarningChecker(WARNINGS);
var editableDivCount = 0;

var observer = new MutationObserver(function(mutations) {
  if (mutations[0]) {
    mutations.forEach(function(mutation) {
      if (mutation.type != 'characterData' && mutation.target.hasAttribute('contentEditable')) {
        id = mutation.target.id;
        if (id) {
          var targetDiv = document.getElementById(id);
          // generate input event to fire checkForWarnings again
          var inputEvent = new Event('input', {
              bubbles: true,
              cancelable: true,
          });
          targetDiv.dispatchEvent(inputEvent);
        }
      }
    });
  }
});

var addObserver = function() {
  warningChecker.addWarnings(this.parentNode);
  observer.observe(this, {characterData: true, subtree: true, childList: true,  attributes: true});
}

var removeObserver = function() {
  warningChecker.removeWarnings(this.parentNode);
  observer.disconnect();
}

var checkForWarnings = function() {
  warningChecker.removeWarnings(this.parentNode);
  warningChecker.addWarnings(this.parentNode);
}

var applyEventListeners = function(id) {
  var targetDiv = document.getElementById(id);
  targetDiv.addEventListener('focus', addObserver);
  targetDiv.addEventListener('input', checkForWarnings);
  targetDiv.addEventListener('blur', removeObserver);
  targetDiv.addEventListener('mousemove', checkDistanceFromWarnings);
}

var documentObserver = new MutationObserver(function(mutations) {
  var divCount = getEditableDivs().length;
  if (divCount != editableDivCount) {
    editableDivCount = divCount;
    var id;
    if (mutations[0]) {
      mutations.forEach(function(mutation) {
        if (mutation.type == 'childList' && mutation.target.hasAttribute('contentEditable')) {
          id = mutation.target.id;
          if (id) {
            applyEventListeners(id);
          }
        }
      });
    }
  }
});

function getEditableDivs() {
  return document.querySelectorAll('div[contentEditable=true]');
}

function isNear(element, distance, event) {
  let rect = getRectDimensions(element);
  let left = rect.left - 2,
    top = rect.top - distance,
    right = left + rect.width,
    bottom = top + rect.height + distance,
    x = event.pageX,
    y = event.pageY;
  return (x > left && x < right && y > top && y < bottom); 
};

function getYOffset(element){
  let yOffset = 20; // Set default
  try { yOffset = parseInt(element.getAttribute('triggerHeight')) } catch (err) {}
  return yOffset;
}

function getRectDimensions(element) {
  let rect = element.getBoundingClientRect();
  return ({
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft,
    width: parseFloat(getComputedStyle(element, null).width.replace("px", "")),
    height: parseFloat(getComputedStyle(element, null).height.replace("px", ""))
  });
}

var checkDistanceFromWarnings = function (e) {
    var elements = document.querySelectorAll('.jns-warning');
    console.log("el length: " + elements.length);
    Array.prototype.forEach.call(elements, function(el, i) {
      let yOffset = getYOffset(el);
      // console.log("Y: " + yOffset);
      console.log(isNear(el,yOffset,e));
      // Assume jns-message is first element for performance
      let messageDiv = el.children[0];
      if (isNear(el,getYOffset(el),e) && !(messageDiv.classList.contains('visible'))) {
          messageDiv.classList.toggle('visible');
      } else if ((messageDiv.classList.contains('visible'))) {
          messageDiv.classList.toggle('visible');
      }
    });
};

documentObserver.observe(document, {subtree: true, childList: true});
