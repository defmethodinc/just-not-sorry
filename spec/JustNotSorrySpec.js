import * as JustNotSorry from '../src/JustNotSorry.js';

import WarningChecker from '../src/WarningChecker.js';

describe('JustNotSorry', function () {
  function generateEditableDiv(id) {
    let editableDiv = document.createElement('DIV');
    editableDiv.setAttribute('id', id);
    editableDiv.setAttribute('contentEditable', 'true');
    document.body.appendChild(editableDiv);
  }

  function dispatchEventOnElement(target, eventName) {
    let event = new Event(eventName, {});
    target.dispatchEvent(event);
  }

  beforeAll(function () {
    generateEditableDiv('div-1');
    generateEditableDiv('div-2');
    generateEditableDiv('div-3');
  });

  describe('#getEditableDivs', function () {
    it('returns an array of all content editable divs within the document', function () {
      let divs = JustNotSorry.getEditableDivs();
      expect(divs.length).toEqual(3);
    });
  });

  describe('#addObserver', function () {
    it('adds an observer that listens for structural changes to the content editable div', function () {
      let target = document.getElementById('div-1');
      spyOn(JustNotSorry.observer, 'observe');

      target.addEventListener('focus', JustNotSorry.addObserver);
      expect(JustNotSorry.observer.observe).not.toHaveBeenCalled();
      dispatchEventOnElement(target, 'focus');
      expect(JustNotSorry.observer.observe).toHaveBeenCalledWith(
        target,
        jasmine.objectContaining({ childList: true })
      );
    });

    it('starts checking for warnings', function (done) {
      spyOn(JustNotSorry, 'checkForWarnings').and.callThrough();
      let target = document.getElementById('div-1');

      target.addEventListener('focus', JustNotSorry.addObserver);
      dispatchEventOnElement(target, 'focus');

      dispatchEventOnElement(target, 'input');

      setTimeout(function () {
        expect(JustNotSorry.checkForWarnings).toHaveBeenCalled();
        done();
      });
    });

    it('adds warnings to the content editable div', function () {
      let target = document.getElementById('div-1');
      spyOn(WarningChecker.prototype, 'addWarnings');

      target.addEventListener('focus', JustNotSorry.addObserver);
      dispatchEventOnElement(target, 'focus');

      expect(WarningChecker.prototype.addWarnings).toHaveBeenCalledWith(
        target.parentNode
      );
    });

    describe('when a global id variable is set', function () {
      beforeEach(function () {
        window.id = 'test value';
      });

      afterEach(function () {
        delete window.id;
      });

      it('keeps that global variable unchanged', function (done) {
        const target = document.getElementById('div-2');
        target.addEventListener('focus', JustNotSorry.addObserver);
        dispatchEventOnElement(target, 'focus');

        target.appendChild(document.createElement('BR'));

        setTimeout(function () {
          expect(id).toEqual('test value');
          done();
        });
      });
    });
  });

  describe('#removeObserver', function () {
    it('removes any existing warnings', function () {
      let target = document.getElementById('div-2');

      spyOn(WarningChecker.prototype, 'removeWarnings');

      target.addEventListener('focus', JustNotSorry.addObserver);
      dispatchEventOnElement(target, 'focus');

      target.addEventListener('blur', JustNotSorry.removeObserver);
      dispatchEventOnElement(target, 'blur');

      expect(WarningChecker.prototype.removeWarnings).toHaveBeenCalledWith(
        target.parentNode
      );
    });

    it('no longer checks for warnings on input events', function (done) {
      spyOn(JustNotSorry, 'checkForWarnings').and.callThrough();
      let target = document.getElementById('div-2');

      target.addEventListener('focus', JustNotSorry.addObserver);
      dispatchEventOnElement(target, 'focus');

      target.addEventListener('blur', JustNotSorry.removeObserver);
      dispatchEventOnElement(target, 'blur');

      dispatchEventOnElement(target, 'input');

      setTimeout(function () {
        expect(JustNotSorry.checkForWarnings).not.toHaveBeenCalled();
        done();
      });
    });

    it('disconnects the observer', function () {
      let target = document.getElementById('div-2');
      spyOn(JustNotSorry.observer, 'observe');
      spyOn(JustNotSorry.observer, 'disconnect');

      target.addEventListener('focus', JustNotSorry.addObserver);
      dispatchEventOnElement(target, 'focus');
      expect(JustNotSorry.observer.observe).toHaveBeenCalled();

      target.addEventListener('blur', JustNotSorry.removeObserver);
      dispatchEventOnElement(target, 'blur');
      expect(JustNotSorry.observer.disconnect).toHaveBeenCalled();
    });
  });

  describe('#checkForWarnings', function () {
    it('updates warnings each time input is triggered', function () {
      let target = document.getElementById('div-3');
      spyOn(JustNotSorry, 'checkForWarnings');
      spyOn(WarningChecker.prototype, 'addWarnings');
      spyOn(WarningChecker.prototype, 'removeWarnings');

      target.addEventListener('input', JustNotSorry.checkForWarnings);
      dispatchEventOnElement(target, 'input');
      dispatchEventOnElement(target, 'input');
      dispatchEventOnElement(target, 'input');

      let callCount = JustNotSorry.checkForWarnings.calls.count();
      expect(callCount).toEqual(3);
    });
  });

  describe('contentEditable observer', function () {
    var newDivId = 'div-5';

    afterEach(function () {
      var targetDiv = document.getElementById(newDivId);
      targetDiv.parentNode.removeChild(targetDiv);
    });

    it('dispatches an input event when nodes are added to a content editable div', function (done) {
      generateEditableDiv(newDivId);
      const target = document.getElementById(newDivId);

      spyOn(WarningChecker.prototype, 'addWarnings');
      spyOn(WarningChecker.prototype, 'removeWarnings');

      // trigger documentObserver to register this content editable div
      target.appendChild(document.createElement('BR'));

      setTimeout(function () {
        dispatchEventOnElement(target, 'focus');
        expect(WarningChecker.prototype.addWarnings).toHaveBeenCalledTimes(1);
        WarningChecker.prototype.addWarnings.calls.reset();

        setTimeout(function () {
          let element = document.createElement('SPAN');
          element.textContent = 'Hello';
          target.appendChild(element);

          setTimeout(function () {
            expect(
              WarningChecker.prototype.removeWarnings
            ).toHaveBeenCalledTimes(1);
            expect(
              WarningChecker.prototype.removeWarnings
            ).toHaveBeenCalledWith(target.parentNode);
            expect(WarningChecker.prototype.addWarnings).toHaveBeenCalledTimes(
              1
            );
            expect(WarningChecker.prototype.addWarnings).toHaveBeenCalledWith(
              target.parentNode
            );
            done();
          }, JustNotSorry.WAIT_TIME_BEFORE_RECALC_WARNINGS + 10);
        });
      });
    });

    it('does not dispatch an input event when a class changes on a content editable div', function (done) {
      generateEditableDiv(newDivId);
      const target = document.getElementById(newDivId);

      spyOn(WarningChecker.prototype, 'addWarnings');
      spyOn(WarningChecker.prototype, 'removeWarnings');

      // trigger documentObserver to register this content editable div
      target.appendChild(document.createElement('BR'));

      setTimeout(function () {
        dispatchEventOnElement(target, 'focus');
        expect(WarningChecker.prototype.addWarnings).toHaveBeenCalledTimes(1);
        WarningChecker.prototype.addWarnings.calls.reset();

        setTimeout(function () {
          target.className = 'test';

          setTimeout(function () {
            expect(
              WarningChecker.prototype.removeWarnings
            ).not.toHaveBeenCalled();
            expect(WarningChecker.prototype.addWarnings).not.toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });

  describe('documentObserver', function () {
    var newDivId = 'div-4';

    beforeEach(function () {
      generateEditableDiv(newDivId);
    });
    afterEach(function () {
      var targetDiv = document.getElementById(newDivId);
      targetDiv.parentNode.removeChild(targetDiv);
    });

    it('sets up event listeners when a new content editable div is added', function (done) {
      spyOn(JustNotSorry.observer, 'observe');
      var targetDiv = document.getElementById(newDivId);

      // trigger documentObserver to register this content editable div
      targetDiv.appendChild(document.createElement('BR'));

      setTimeout(function () {
        dispatchEventOnElement(targetDiv, 'focus');
        expect(JustNotSorry.observer.observe).toHaveBeenCalledTimes(1);
        expect(JustNotSorry.observer.observe).toHaveBeenCalledWith(
          targetDiv,
          jasmine.objectContaining({ subtree: true, childList: true })
        );
        done();
      });
    });
  });
});
