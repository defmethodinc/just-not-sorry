describe('WARNINGS', function () {
  function isBlank(str) {
    return (!str || /^\s*$/.test(str));
  }

  // from http://stackoverflow.com/a/8317014
  function isValidUrl(str) {
    return (str && /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str));
  }

  // from http://stackoverflow.com/a/14313213
  function findNonASCIIChars(str) {
    return str.match(/[^\x00-\x7F]+/g);
  }

  function findIndexOfFirstNonASCIIChar(str) {
    return str.search(/[^\x00-\x7F]+/);
  }

  it('has a root element', function () {
    expect(WARNINGS.hasOwnProperty('warnings')).toBeTruthy();
  });

  it('contains an array of warnings', function () {
    expect(WARNINGS.warnings instanceof Array).toBeTruthy();
  });

  WARNINGS.warnings.forEach(function (warning, index) {
    describe('for warning at index ' + index + ' (keyword: "' + warning.keyword + '")', function () {
      describe('the keyword', function () {
        it('should be present', function () {
          expect(warning.hasOwnProperty('keyword')).toBeTruthy();
        });

        it('should be non-blank', function () {
          expect(isBlank(warning.keyword)).toBeFalsy();
        });

        it('should be a valid regular expression', function () {
          var regex = new RegExp(warning.keyword, 'gi');
          expect(regex.test(warning.keyword)).toBeTruthy();
        });
      });

      describe('the source', function () {
        it('should be present', function() {
          expect(warning.hasOwnProperty('source')).toBeTruthy();
        });

        it('should be non-blank', function () {
          expect(isBlank(warning.source)).toBeFalsy();
        });

        it('should be a valid url', function() {
          expect(isValidUrl(warning.source)).toBeTruthy();
        });
      });

      describe('the message', function () {
        it('should be present', function() {
          expect(warning.hasOwnProperty('message')).toBeTruthy();
        });

        it('should be non-blank', function () {
          expect(isBlank(warning.message)).toBeFalsy();
        });

        it('should contain only ASCII characters', function() {
          expect(findNonASCIIChars(warning.message)).toEqual(null);
          expect(findIndexOfFirstNonASCIIChar(warning.message)).toEqual(-1);
        });
      });
    });
  });

});