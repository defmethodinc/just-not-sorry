describe('WarningChecker', function() {
  describe('.addWarning', function() {
    var checker;
    var host;

    beforeEach(function() {
      checker = new WarningChecker({});
      host = spyOn(HighlightGenerator, 'getHostname').and.returnValue('mail.google.com')
    });

    it('delegates to domRegexpMatch', function() {
      var matcherSpy = spyOn(window, 'domRegexpMatch');
      var content = 'test just test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture, 'just', 'warning message');
      expect(matcherSpy).toHaveBeenCalled();
    });

    it('passes the message and warningClass to the highlight generator callback', function() {
      var matcherSpy = spyOn(window, 'domRegexpMatch');
      var generatorSpy = spyOn(HighlightGenerator, 'highlightMatches');
      var content = 'test just test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture, 'just', 'warning message', 'compose gmail');
      expect(generatorSpy).toHaveBeenCalledWith('warning message', 'jns-warning', 'compose gmail');
    });

    it('adds a warning for a single keyword', function() {
      var content = 'test just test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture[0], 'just', 'warning message', 'compose');
      expect($fixture.find('div.jns-warning').length).toEqual(1);
    });

    it('does not add warnings for partial matches', function() {
      var content = 'test justify test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture, 'just', 'warning message');
      expect($fixture.find('div.jns-warning').length).toEqual(0);
    });

    it('adds multiple warnings when keyword is matched multiple times', function() {
      var content = 'test just test just test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture[0], 'just', 'warning message', 'compose');
      expect($fixture.find('div.jns-warning').length).toEqual(2);
    });

    it('adds a title element to provide a message in a tooltip', function() {
      var content = 'test just test sorry test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture[0], 'just', 'warning message', 'compose');
      expect($fixture.find('div.jns-warning')[0].title).toEqual('warning message');
    });

    it('matches case insensitive', function() {
      var content = 'jUsT kidding';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture[0], 'just', 'warning message', 'compose');
      expect($fixture.find('div.jns-warning').length).toEqual(1);
    });

    it('catches keywords with punctuation', function() {
      var content = 'just. test';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture[0], 'just', 'warning message', 'compose');
      expect($fixture.find('div.jns-warning').length).toEqual(1);
    });

    it('matches phrases', function() {
      var content = 'my cat is so sorry because of you';
      var $fixture = setFixtures(content);
      checker.addWarning($fixture[0], 'so sorry', 'warning message', 'compose');
      expect($fixture.find('div.jns-warning').length).toEqual(1);
    });
  });

  describe('multiple warnings', function() {
    var checker;
    var host;

    beforeEach(function() {
      checker = new WarningChecker(
        {
          warningClass: 'warning1',
          warnings: [
            { keyword: 'just', message: 'test'},
            { keyword: 'so sorry', message: 'test 2'},
          ],
        }
      );
      host = spyOn(HighlightGenerator, 'getHostname').and.returnValue('mail.google.com')
    });

    describe('.addWarnings', function() {
      it('does nothing when given an empty string', function() {
        var content = '';
        var $fixture = setFixtures(content);
        checker.addWarnings($fixture[0]);
        expect($fixture.find('div.warning1').length).toEqual(0);
      });

      it('adds warnings to all keywords', function() {
        var content = 'I am just so sorry. Yes, just.';
        var $fixture = setFixtures(content);
        checker.addWarnings($fixture[0], 'compose');
        expect($fixture.find('div.warning1').length).toEqual(3);
        expect($fixture.find('div.warning1[title="test"]').length).toEqual(2);
        expect($fixture.find('div.warning1[title="test 2"]').length).toEqual(1);
      });
    });

    describe('.removeWarnings', function() {
      it('removes all warnings', function() {
        var content = 'I am so sorry';
        var $fixture = setFixtures(content);
        $fixture.append($('<div class="warning1"></div>'));
        expect($fixture.find('div.warning1').length).toEqual(1);

        checker.removeWarnings($fixture[0]);
        expect($fixture.find('div.warning1').length).toEqual(0);
      });
    });
  });
});
