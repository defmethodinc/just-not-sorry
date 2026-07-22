import '@testing-library/jest-dom';

class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// Work-around for jsdom not supporting offsetParent
// https://github.com/jsdom/jsdom/issues/1261
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() {
    return this.parentNode;
  },
});
