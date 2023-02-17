import { findRanges } from '../src/helpers/RangeFinder';

describe('RangeFinder', () => {
  const PHRASE_TO_FIND = {
    regex: new RegExp('textToFind', 'ig'),
    message: 'text found!',
  };
  let element;
  beforeEach(() => {
    element = document.createElement('div');
  });
  it('should return empty array if given empty array', () => {
    const ranges = findRanges(element, []);
    expect(ranges.size).toBe(0);
  });

  it('should return map with message and array of ranges for each match found', () => {
    element.textContent = 'textToFind';

    const ranges = findRanges(element, [PHRASE_TO_FIND]);

    expect(ranges.size).toBe(1);
    expect(ranges.has('text found!')).toEqual(true);
    expect(ranges.get('text found!')).toEqual([new Range()]);
  });
});
