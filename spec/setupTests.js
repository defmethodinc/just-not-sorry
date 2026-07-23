import '@testing-library/jest-dom';

class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// Work-around for DOM environments that do not support offsetParent
// https://github.com/jsdom/jsdom/issues/1261
if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')) {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() {
      return this.parentNode;
    },
  });
}
