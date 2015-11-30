describe('WarningChecker', function() {
  var checker = new WarningChecker();

  describe('.addWarning', function() {
    it('handles an empty string', function() {
      var content = '';
      var result = checker.addWarning(content, 'just', 'just-warning');
      expect(result).toEqual(content);
    });

    it('adds a warning around just', function() {
      var content = 'test just test';
      var result = checker.addWarning(content, 'just', 'just-warning');
      expect(result).toMatch(/<span class="just-warning">just<\/span>/);
    });

    it('adds a warning around sorry', function() {
      var content = 'test just test sorry test';
      var result = checker.addWarning(content, 'sorry', 'sorry-warning');
      expect(result).toMatch(/<span class="sorry-warning">sorry<\/span>/);
    });

    it('handles multiple instances of a keyword', function() {
      var content = 'sorry sorry';
      var result = checker.addWarning(content, 'sorry', 'sorry-warning');
      expect(result).toEqual('<span class="sorry-warning">sorry<\/span> <span class="sorry-warning">sorry<\/span>');
    });

    it('does not wrap a keyword that has already been wrapped', function() {
      var content = '<span class="blah-warning">sorry<\/span> <span class="blah-warning">sorry<\/span>';
      var result = checker.addWarning(content, 'sorry', 'blah-warning');
      expect(result).toEqual(content);
    });

    it('matches case insensitive', function() {
      var content = 'jUsT';
      var result = checker.addWarning(content, 'just', 'just-warning');
      expect(result).toMatch(/<span class="just-warning">jUsT<\/span>/);
    });

    it('catches keywords with punctuation', function() {
      var content = 'just. test';
      var result = checker.addWarning(content, 'just', 'just-warning');
      expect(result).toEqual('<span class="just-warning">just<\/span>. test');
    });

    it('matches phrases', function() {
      var content = 'my cat is so sorry because of you';
      var result = checker.addWarning(content, 'so sorry', 'big-warning');
      expect(result).toEqual('my cat is <span class="big-warning">so sorry<\/span> because of you');
    });

    it('only matches the whole word', function() {
      var content = 'my justification';
      var result = checker.addWarning(content, 'just', 'just-warning');
      expect(result).toEqual(content);
    });
  });
});
