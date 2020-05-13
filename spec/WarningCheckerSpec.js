import WarningChecker from '../src/components/WarningChecker.js';
import $ from 'jquery';
import 'jasmine-jquery';

describe('WarningChecker', function () {
  describe('.addWarning', function () {
    var checker;

    beforeEach(function () {
      checker = new WarningChecker({});
    });

    it('adds a warning for a single keyword', async function (done) {
      var content = 'test just test';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture[0], 'just', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning').length).toEqual(1);
        done();
      });
    });

    it('does not add warnings for partial matches', async function (done) {
      var content = 'test justify test';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture, 'just', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning').length).toEqual(0);
        done();
      });
    });

    it('adds multiple warnings when keyword is matched multiple times', async function (done) {
      var content = 'test just test just test';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture[0], 'just', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning').length).toEqual(2);
        done();
      });
    });

    it('adds a title element to provide a message in a tooltip', async function (done) {
      var content = 'test just test sorry test';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture[0], 'just', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning')[0].title).toEqual(
          'warning message'
        );
        done();
      });
    });

    it('matches case insensitive', async function (done) {
      var content = 'jUsT kidding';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture[0], 'just', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning').length).toEqual(1);
        done();
      });
    });

    it('catches keywords with punctuation', async function (done) {
      var content = 'just. test';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture[0], 'just', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning').length).toEqual(1);
        done();
      });
    });

    it('matches phrases', async function (done) {
      var content = 'my cat is so sorry because of you';
      var $fixture = window.setFixtures(content);
      await checker.addWarning($fixture[0], 'so sorry', 'warning message');
      requestAnimationFrame(function () {
        expect($fixture.find('div.jns-warning').length).toEqual(1);
        done();
      });
    });
  });

  describe('multiple warnings', function () {
    var checker;

    beforeEach(function () {
      checker = new WarningChecker({
        warningClass: 'warning1',
        warnings: [
          { keyword: 'just', message: 'test' },
          { keyword: 'so sorry', message: 'test 2' },
        ],
      });
    });

    describe('.addWarnings', function () {
      it('does nothing when given an empty string', async function (done) {
        var content = '';
        var $fixture = window.setFixtures(content);
        await checker.addWarnings($fixture[0]);
        requestAnimationFrame(function () {
          expect($fixture.find('div.warning1').length).toEqual(0);
          done();
        });
      });

      it('adds warnings to all keywords', async function (done) {
        var content = 'I am just so sorry. Yes, just.';
        var $fixture = window.setFixtures(content);
        await checker.addWarnings($fixture[0]);
        requestAnimationFrame(function () {
          expect($fixture.find('div.warning1').length).toEqual(3);
          expect($fixture.find('div.warning1[title="test"]').length).toEqual(2);
          expect($fixture.find('div.warning1[title="test 2"]').length).toEqual(
            1
          );
          done();
        });
      });
    });

    describe('.removeWarnings', function () {
      it('removes all warnings', async function (done) {
        var content = 'I am so sorry';
        var $fixture = window.setFixtures(content);
        $fixture.append($('<div class="warning1"></div>'));

        expect($fixture.find('div.warning1').length).toEqual(1);

        await checker.removeWarnings($fixture[0]);

        requestAnimationFrame(function () {
          expect($fixture.find('div.warning1').length).toEqual(0);
          done();
        });
      });
    });
  });
});
