import * as Util from '../src/helpers/util.js';

describe('Util', () => {
  describe('#debounce', () => {
    const WAIT_TIME = 500;

    let func;
    let debouncedFunc;

    beforeEach(() => {
      jest.useFakeTimers();
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
        jest.advanceTimersByTime(WAIT_TIME + 100);
        expect(func).toBeCalledTimes(i);
      }
      jest.runAllTimers();
      expect(func).toBeCalledTimes(3);
    });
  });

  describe('match', () => {
    it('should find a match if it exists', () => {
      const div = document.createElement('div');
      div.textContent = 'just checking';

      const ranges = Util.match(div, /just/gi);
      expect(ranges.length).toEqual(1);
    });

    it('should find multiple a match if it exists', () => {
      const div = document.createElement('div');
      div.textContent = 'just checking just';

      const ranges = Util.match(div, /just/gi);
      expect(ranges.length).toEqual(2);
    });

    it('should not find a match if it doesnt exist', () => {
      const div = document.createElement('div');
      div.textContent = 'just checking';

      const ranges = Util.match(div, /bogus/gi);
      expect(ranges.length).toEqual(0);
    });
  });
});
