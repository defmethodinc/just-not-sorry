// from underscore.js
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
import RangeAtIndex from 'range-at-index';

export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// from dom-regexp-match
export function match(el, regexp) {
  const ranges = [];
  const text = el.textContent;
  let m;
  while ((m = regexp.exec(text)) !== null) {
    const offset = m.index + m[0].length;
    ranges.push(new RangeAtIndex(el, m.index, offset));
    // if the RegExp doesn't have the "global" flag then bail,
    // to avoid an infinite loop
    if (!regexp.global) break;
  }
  return ranges;
}

export const WAIT_TIME = 500;
