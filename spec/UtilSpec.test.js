import * as Util from '../src/components/util.js';

describe('Util', () => {
  describe('#debounce', () => {
    const WAIT_TIME = 500;

    jest.useFakeTimers();
    let func = jest.Mock;
    let debouncedFunc = Function;

    beforeEach(() => {
      func = jest.fn();
      debouncedFunc = Util.debounce(func, WAIT_TIME);
    });

    it('should execute a function only once if the debounced function is invoked several times within the wait time', () => {
      for (let i = 0; i < 3; i++) {
        debouncedFunc();
      }
      jest.runAllTimers();
      expect(func).toBeCalledTimes(1);
    });

    it('should execute a function as many times as the debounced function if called beyond the wait time', () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => debouncedFunc(), WAIT_TIME + 100);
      }
      jest.runAllTimers();
      expect(func).toBeCalledTimes(3);
    });
  });
});
