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
    it('adds an observer on focus of an element', function () {
      let target = document.getElementById('div-1');
      spyOn(observer, 'observe');

      target.addEventListener('focus', addObserver);
      expect(observer.observe).not.toHaveBeenCalled();
      dispatchEventOnElement(target, 'focus');
      expect(observer.observe).toHaveBeenCalled();
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

        target.innerHTML = '<br/>';

        setTimeout(function () {
          expect(id).toEqual('test value');
          done();
        });
      });
    });
  });

  describe('#removeObserver', function() {
    it('disconnects the observer on blur of an element', function () {
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
});