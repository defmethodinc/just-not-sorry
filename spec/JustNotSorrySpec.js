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

  beforeAll(function() {
      generateEditableDiv('div-1');
      generateEditableDiv('div-2');
      generateEditableDiv('div-3');
  });

  describe('#getEditableDivs', function() {
    it('returns an array of all content editable divs within the document', function () {
      let divs = getEditableDivs();
      expect(divs.length).toEqual(3);
    });
  });

  describe('#addObserver', function() {
    it('adds an observer that listens for structural changes to the content editable div', function () {
      let target = document.getElementById('div-1');
      spyOn(observer, 'observe');

      target.addEventListener('focus', addObserver);
      expect(observer.observe).not.toHaveBeenCalled();
      dispatchEventOnElement(target, 'focus');
      expect(observer.observe).toHaveBeenCalledWith(target, jasmine.objectContaining({childList: true}));
    });

    it('starts checking for warnings', function(done) {
      spyOn(window, 'checkForWarnings').and.callThrough();
      let target = document.getElementById('div-1');

      target.addEventListener('focus', addObserver);
      dispatchEventOnElement(target, 'focus');

      dispatchEventOnElement(target, 'input');

      setTimeout(function () {
        expect(window.checkForWarnings).toHaveBeenCalled();
        done();
      });
    });

    it('adds warnings to the content editable div', function() {
      let target = document.getElementById('div-1');
      spyOn(warningChecker, 'addWarnings');

      target.addEventListener('focus', addObserver);
      dispatchEventOnElement(target, 'focus');

      expect(warningChecker.addWarnings).toHaveBeenCalledWith(target.parentNode);
    });

    describe('when a global id variable is set', function() {
      beforeEach(function() {
        window.id = 'test value';
      });

      afterEach(function() {
        delete window.id;
      });

      it('keeps that global variable unchanged', function(done) {
        const target = document.getElementById('div-2');
        target.addEventListener('focus', addObserver);
        dispatchEventOnElement(target, 'focus');

        target.appendChild(document.createElement('BR'));

        setTimeout(function () {
          expect(id).toEqual('test value');
          done();
        });
      });
    });
  });

  describe('#removeObserver', function() {
    it('removes any existing warnings', function() {
      let target = document.getElementById('div-2');
      spyOn(warningChecker, 'removeWarnings');

      target.addEventListener('focus', addObserver);
      dispatchEventOnElement(target, 'focus');

      target.addEventListener('blur', removeObserver);
      dispatchEventOnElement(target, 'blur');

      expect(warningChecker.removeWarnings).toHaveBeenCalledWith(target.parentNode);
    });

    it('no longer checks for warnings on input events', function(done) {
      spyOn(window, 'checkForWarnings').and.callThrough();
      let target = document.getElementById('div-2');

      target.addEventListener('focus', addObserver);
      dispatchEventOnElement(target, 'focus');

      target.addEventListener('blur', removeObserver);
      dispatchEventOnElement(target, 'blur');

      dispatchEventOnElement(target, 'input');

      setTimeout(function () {
        expect(window.checkForWarnings).not.toHaveBeenCalled();
        done();
      });
    });

    it('disconnects the observer', function () {
      let target = document.getElementById('div-2');
      spyOn(observer, 'observe');
      spyOn(observer, 'disconnect');

      target.addEventListener('focus', addObserver);
      dispatchEventOnElement(target, 'focus');
      expect(observer.observe).toHaveBeenCalled();

      target.addEventListener('blur', removeObserver);
      dispatchEventOnElement(target, 'blur');
      expect(observer.disconnect).toHaveBeenCalled();
    });
  });

  describe('#checkForWarnings', function() {
    it('updates warnings each time input is triggered', function () {
      let target = document.getElementById('div-3');
      spyOn(window, 'checkForWarnings');
      spyOn(warningChecker, 'addWarnings');
      spyOn(warningChecker, 'removeWarnings');

      target.addEventListener('input', checkForWarnings);
      dispatchEventOnElement(target, 'input');
      dispatchEventOnElement(target, 'input');
      dispatchEventOnElement(target, 'input');

      let callCount = window.checkForWarnings.calls.count();
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

      spyOn(warningChecker, 'addWarnings');
      spyOn(warningChecker, 'removeWarnings');

      // trigger documentObserver to register this content editable div
      target.appendChild(document.createElement('BR'));

      setTimeout(function () {
        dispatchEventOnElement(target, 'focus');
        expect(warningChecker.addWarnings).toHaveBeenCalledTimes(1);
        warningChecker.addWarnings.calls.reset();

        setTimeout(function () {
          let element = document.createElement('SPAN');
          element.textContent = 'Hello';
          target.appendChild(element);

          setTimeout(function () {
            expect(warningChecker.removeWarnings).toHaveBeenCalledTimes(1);
            expect(warningChecker.removeWarnings).toHaveBeenCalledWith(target.parentNode);
            expect(warningChecker.addWarnings).toHaveBeenCalledTimes(1);
            expect(warningChecker.addWarnings).toHaveBeenCalledWith(target.parentNode);
            done();
          }, 510);
        });
      });
    });

    it('does not dispatch an input event when a class changes on a content editable div', function (done) {
      generateEditableDiv(newDivId);
      const target = document.getElementById(newDivId);

      spyOn(warningChecker, 'addWarnings');
      spyOn(warningChecker, 'removeWarnings');

      // trigger documentObserver to register this content editable div
      target.appendChild(document.createElement('BR'));

      setTimeout(function () {
        dispatchEventOnElement(target, 'focus');
        expect(warningChecker.addWarnings).toHaveBeenCalledTimes(1);
        warningChecker.addWarnings.calls.reset();

        setTimeout(function () {

          target.className = 'test';

          setTimeout(function () {
            expect(warningChecker.removeWarnings).not.toHaveBeenCalled();
            expect(warningChecker.addWarnings).not.toHaveBeenCalled();
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
      spyOn(observer, 'observe');
      var targetDiv = document.getElementById(newDivId);

      // trigger documentObserver to register this content editable div
      targetDiv.appendChild(document.createElement('BR'));

      setTimeout(function () {
        dispatchEventOnElement(targetDiv, 'focus');
        expect(observer.observe).toHaveBeenCalledTimes(1);
        expect(observer.observe).toHaveBeenCalledWith(targetDiv, jasmine.objectContaining({subtree: true, childList: true}));
        done();
      });
    });
  });
});