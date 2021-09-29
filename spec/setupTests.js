// Work-around for jsdom not supporting offsetParent
// https://github.com/jsdom/jsdom/issues/1261
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() {
    return this.parentNode;
  },
});
