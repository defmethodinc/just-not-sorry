import WARNING_MESSAGES from '../src/warnings/phrases.json';

describe('WARNING_MESSAGES', () => {
  function isBlank(str) {
    return !str || /^\s*$/.test(str);
  }

  // from http://stackoverflow.com/a/8317014
  function isValidUrl(str) {
    return (
      str &&
      /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
        str
      )
    );
  }

  // from http://stackoverflow.com/a/14313213
  function findNonASCIIChars(str) {
    // eslint-disable-next-line no-control-regex
    return str.match(/[^\x00-\x7F]+/g);
  }

  function findIndexOfFirstNonASCIIChar(str) {
    // eslint-disable-next-line no-control-regex
    return str.search(/[^\x00-\x7F]+/);
  }

  it('contains an array of warnings', () => {
    expect(WARNING_MESSAGES instanceof Array).toBeTruthy();
  });

  WARNING_MESSAGES.forEach(function (warning, index) {
    describe(
      'for warning at index ' + index + ' (regex: "' + warning.regex + '")',
      () => {
        describe('the regex', () => {
          it('should be present', () => {
            expect(
              Object.prototype.hasOwnProperty.call(warning, 'regex')
            ).toBeTruthy();
          });

          it('should be non-blank', () => {
            expect(isBlank(warning.regex)).toBeFalsy();
          });
        });

        describe('the displayLabel', () => {
          it('should be present', () => {
            expect(isBlank(warning.displayLabel)).toBeFalsy();
          });
          it('should be an array', () => {
            expect(Array.isArray(warning.displayLabel)).toBeTruthy();
          });
        });
        describe('the source', () => {
          it('should be present', () => {
            expect(
              Object.prototype.hasOwnProperty.call(warning, 'source')
            ).toBeTruthy();
          });

          it('should be non-blank', () => {
            expect(isBlank(warning.source)).toBeFalsy();
          });

          it('should be a valid url', () => {
            expect(isValidUrl(warning.source)).toBeTruthy();
          });
        });

        describe('the message', () => {
          it('should be present', () => {
            expect(
              Object.prototype.hasOwnProperty.call(warning, 'message')
            ).toBeTruthy();
          });

          it('should be non-blank', () => {
            expect(isBlank(warning.message)).toBeFalsy();
          });

          it('should contain only ASCII characters', () => {
            expect(findNonASCIIChars(warning.message)).toEqual(null);
            expect(findIndexOfFirstNonASCIIChar(warning.message)).toEqual(-1);
          });
        });
      }
    );
  });
});
