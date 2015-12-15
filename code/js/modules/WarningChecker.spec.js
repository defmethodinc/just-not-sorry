var $ = require('../libs/jquery');
var fixtures = require('js-fixtures');
var expect = require('expect.js');
var WarningChecker = require('./WarningChecker');

describe('WarningChecker', function() {
  var checker = new WarningChecker({});
  var $fixtureDiv;

  beforeEach(function() {
    fixtures.set('<div id="fixture"></div>');
    $fixtureDiv = $('#js-fixtures').contents().find('#fixture');
  });

  afterEach(function() {
    fixtures.cleanUp();
  });

  describe('.addWarning', function() {
    it('handles an empty string', function() {
      var content = '';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'just', 'warning');
      expect(result).to.eql(content);
    });

    it('adds a warning around a keyword', function() {
      var content = 'test just test';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'just', 'warning');
      expect(result).to.match(/<span class="warning">just<\/span>/);
    });

    it('adds a title element to provide a message in a tooltip', function() {
      var content = 'test just test sorry test';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'sorry', 'warning', 'a message');
      expect(result).to.match(/<span class="warning" title="a message">sorry<\/span>/);
    });

    it('handles multiple instances of a keyword', function() {
      var content = 'sorry sorry test';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'sorry', 'warning');
      expect(result).to.eql('<span class="warning">sorry<\/span> <span class="warning">sorry<\/span> test');
    });

    it('does not wrap a keyword that has already been wrapped', function() {
      var content = '<span class="blah-warning">sorry<\/span> <span class="blah-warning">sorry<\/span>';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'sorry', 'blah-warning');
      expect(result).to.eql(content);
    });

    it('wraps a keyword that is within an un-related span', function() {
      var content = 'Why so <span class="blue">sorry<\/span>?';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'sorry', 'blah-warning');
      expect(result).to.eql('Why so <span class="blue"><span class="blah-warning">sorry<\/span><\/span>?');
    });

    it('matches case insensitive', function() {
      var content = 'jUsT kidding';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'just', 'warning');
      expect(result).to.match(/<span class="warning">jUsT<\/span>/);
    });

    it('catches keywords with punctuation', function() {
      var content = 'just. test';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'just', 'warning');
      expect(result).to.eql('<span class="warning">just<\/span>. test');
    });

    it('matches phrases', function() {
      var content = 'my cat is so sorry because of you';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'so sorry', 'big-warning');
      expect(result).to.eql('my cat is <span class="big-warning">so sorry<\/span> because of you');
    });

    it('only matches the whole word', function() {
      var content = 'my justification';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'just', 'warning');
      expect(result).to.eql(content);
    });

    it('does NOT perform replacement when target word is before a <br> otherwise Gmail will include words after the keyword in the span', function() {
      var content = 'I just<br>';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.addWarning($fixture, 'just', 'warning');
      expect(result).to.eql('I just<br>');
    });

    it('does not allow the warningClass to contain the keyword', function() {
      expect(function() {
        var $fixture = $('just sorry');
        checker.addWarning($fixture, 'just', 'just-warning');
      }).to.throwError(/warningClass cannot contain the keyword/);
    });
  });

  describe('.removeWarning', function() {
    it('does nothing when given an empty string', function() {
      var content = '';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.removeWarning($fixture, 'warning');
      expect(result).to.eql(content);
    });

    it('removes the warning class', function() {
      var content = '<span class="warning">just</span>';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.removeWarning($fixture, 'warning');
      expect(result).to.eql('just');
    });

    it('removes multiple warning classes', function() {
      var content = 'I am <span class="warning">just</span> so <span class="warning">sorry</span>';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.removeWarning($fixture, 'warning');
      expect(result).to.eql('I am just so sorry');
    });

    it('handles nested spans', function() {
      var content = 'I am <span style="background-color: blue"><span class="warning">sorry</span></span>!';
      var $fixture = $fixtureDiv.html(content);
      var result = checker.removeWarning($fixture, 'warning');
      expect(result).to.eql('I am <span style="background-color: blue">sorry</span>!');
    });
  });

  describe('multiple warnings', function() {
    var checker = new WarningChecker(
      {
        warningClass: 'warning1',
        warnings: [
          { keyword: 'just', message: 'test'},
          { keyword: 'so sorry', message: 'test 2'},
        ],
      }
    );

    describe('.addWarnings', function() {
      it('does nothing when given an empty string', function() {
        var content = '';
        var $fixture = $fixtureDiv.html(content);
        var result = checker.addWarnings($fixture);
        expect(result).to.eql(content);
      });

      it('adds warnings to all keywords', function() {
        var content = 'I am just so sorry sorry. Yes, just.';
        var $fixture = $fixtureDiv.html(content);
        var result = checker.addWarnings($fixture);
        var expectedResult = 'I am <span class="warning1" title="test">' +
          'just<\/span> <span class="warning1" title="test 2">so sorry' +
          '<\/span> sorry. Yes, <span class="warning1" title="test">just' +
          '<\/span>.';
        expect(result).to.eql(expectedResult);
      });
    });

    describe('.removeWarnings', function() {
      it('does nothing when given an empty string', function() {
        var content = '';
        var $fixture = $fixtureDiv.html(content);
        var result = checker.removeWarnings($fixture);
        expect(result).to.eql(content);
      });

      it('removes all warningClasses', function() {
        var content = 'I am <span class="warning1">just<\/span> <span class="warning1">so sorry<\/span> sorry. Yes, <span class="warning1">just<\/span>.';
        var $fixture = $fixtureDiv.html(content);
        var result = checker.removeWarnings($fixture);
        expect(result).to.eql('I am just so sorry sorry. Yes, just.');
      });
    });
  });
});
