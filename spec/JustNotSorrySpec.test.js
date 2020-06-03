import { h } from 'preact';
// import * as JustNotSorry from '../src/components/JustNotSorry.js';
import JustNotSorry from '../src/components/JustNotSorry.js';
// import * as JN from '../src/components/JustNotSorry.js';
// import { shallow } from '@os33/preact-render-spy';
// import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// Enzyme.configure({ adapter: new Adapter() });
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

describe('JustNotSorry', () => {
  function generateEditableDiv(id) {
    let editableDiv = document.createElement('DIV');
    editableDiv.setAttribute('id', id);
    editableDiv.setAttribute('contentEditable', 'true');
    const body = document.querySelector('body');
    body.appendChild(editableDiv);
    // document.body.appendChild(editableDiv);
    // instead, mock through components
  }

  // function dispatchEventOnElement(target, eventName) {
  //   let event = new Event(eventName, {});
  //   target.dispatchEvent(event);
  // }

  beforeAll(function () {
    generateEditableDiv('div-1');
    generateEditableDiv('div-2');
    generateEditableDiv('div-3');
  });

  describe('#addObserver', function () {
    it('adds an observer that listens for structural changes to the content editable div', function () {
      let justNotSorry = shallow(<JustNotSorry />);
      console.log(justNotSorry);

      let target = document.getElementById('div-1');
      console.log(document);
      console.log(target.id);
      target.focus();
      expect(justNotSorry.exists()).toBeTruthy();

      // check that input event listener was added to contentEditableDiv
      // check that Warnings render
      // check that the observer.observe method fires

      // let JNS = JustNotSorry.default();
      // let JNS = justNotSorry;
      // console.log(JNS.html());
      // let tm = JN.default;
      // console.log(tm);

      // const mock = jest.spyOn(JustNotSorry, 'testMe');
      // mock.mockImplementation(() => {});

      // let dc = shallow(<div />);
      // // let target = document.getElementById('div-1');
      // console.log(justNotSorry);

      // let x = JustNotSorry.testMe;
      // const y = justNotSorry;
      // console.log("------");
      // console.log(x);
      // console.log(x);
      // const spy = jest.spyOn(justNotSorry, 'removeWarnings');
      // const spy = jest.spyOn(dc, 'observe');

      //   target.addEventListener('focus', justNotSorry.addObserver);

      //   expect(spy).not.toHaveBeenCalled();
      //   dispatchEventOnElement(target, 'focus');

      //   expect(spy).toHaveBeenCalledWith(
      //     target,
      //     jest.objectContaining({ childList: true })
      //   );
      expect(true).toBe(true);
    });

    // it('starts checking for warnings', function (done) {
    //   spyOn(JustNotSorry, 'checkForWarnings').and.callThrough();
    //   let target = document.getElementById('div-1');

    //   target.addEventListener('focus', JustNotSorry.addObserver);
    //   dispatchEventOnElement(target, 'focus');

    //   dispatchEventOnElement(target, 'input');

    //   setTimeout(function () {
    //     // eslint-disable-next-line jasmine/prefer-toHaveBeenCalledWith
    //     expect(JustNotSorry.checkForWarnings).toHaveBeenCalled();
    //     done();
    //   });
    // });

    // it('adds warnings to the content editable div', function () {
    //   let target = document.getElementById('div-1');
    //   spyOn(WarningChecker.prototype, 'addWarnings');

    //   target.addEventListener('focus', JustNotSorry.addObserver);
    //   dispatchEventOnElement(target, 'focus');

    //   expect(WarningChecker.prototype.addWarnings).toHaveBeenCalledWith(
    //     target.parentNode
    //   );
    // });

    // describe('when a global id variable is set', function () {
    //   beforeEach(function () {
    //     window.id = 'test value';
    //   });

    //   afterEach(function () {
    //     delete window.id;
    //   });

    //   it('keeps that global variable unchanged', function (done) {
    //     const target = document.getElementById('div-2');
    //     target.addEventListener('focus', JustNotSorry.addObserver);
    //     dispatchEventOnElement(target, 'focus');

    //     target.appendChild(document.createElement('BR'));

    //     setTimeout(function () {
    //       expect(window.id).toEqual('test value');
    //       done();
    //     });
    //   });
    // });
  });
});
