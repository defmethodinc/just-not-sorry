import { calculateWarnings } from '../src/helpers/RangeFinder';

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
    const ranges = calculateWarnings(element, []);
    expect(ranges.length).toBe(0);
  });

  it('should return array with message and valid range for each match found', () => {
    element.textContent = 'textToFind';

    const ranges = calculateWarnings(element, [PHRASE_TO_FIND]);

    expect(ranges.length).toBe(1);
    expect(ranges).toEqual([
      { message: 'text found!', rangeToHighlight: new Range() },
    ]);
  });
});
