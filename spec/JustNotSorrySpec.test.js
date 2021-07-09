import { h } from 'preact';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });
jest.useFakeTimers();

document.createRange = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
  startContainer:
    "The word 'very' does not communicate enough information. Find a stronger, more meaningful adverb, or omit it completely. --Andrea Ayres",
  getClientRects: jest.fn(() => [{}]),
}));

const buildWarning = (pattern, message) => ({
  regex: new RegExp(pattern, 'ig'),
  message,
});

const enterText = (text) => {
  return mount(
    <div props={{ id: 'div-focus' }} contentEditable={'true'}>
      {text ? text : ''}
    </div>
  );
};

describe('JustNotSorry', () => {
  let wrapper, instance, mutationObserverMock;

  beforeEach(() => {
    mutationObserverMock = jest.fn(function MutationObserver(callback) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = (mockedMutationList) => {
        callback(mockedMutationList, this);
      };
    });
    global.MutationObserver = mutationObserverMock;

    wrapper = mount(<JustNotSorry />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('documentObserver', () => {
    it('listens for structural changes to the content editable div in document body', () => {
      const observerInstances = mutationObserverMock.mock.instances;
      expect(observerInstances.length).toBe(1);
      expect(observerInstances[0].observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    });
  });

  describe('#handleSearch', () => {
    let handleSearch;
    describe('on focus', () => {
      const setupHandler = () => {
        handleSearch = jest.spyOn(instance, 'handleSearch');
      };

      const assertHandlerWasCalled = () => {
        expect(handleSearch).toHaveBeenCalledTimes(1);
      };

      beforeEach(setupHandler);
      afterEach(assertHandlerWasCalled);

      it('checks for warnings', () => {
        const node = enterText('just not sorry');

        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('focus');
        jest.runOnlyPendingTimers();

        expect(wrapper.state('warnings').length).toEqual(2);
      });

      it('does nothing when given an empty string', () => {
        const node = enterText();

        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('focus');
        jest.runOnlyPendingTimers();

        expect(wrapper.state('warnings').length).toEqual(0);
      });
    });

    describe('on input', () => {
      it('updates warnings each time input is triggered', () => {
        const handleSearch = jest.spyOn(instance, 'handleSearch');
        const node = enterText('just not sorry');

        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('input');
        jest.runOnlyPendingTimers();
        expect(handleSearch).toHaveBeenCalledTimes(1);
      });
    });

    describe('on cut', () => {
      it('updates warnings each time input is triggered', () => {
        const handleSearch = jest.spyOn(instance, 'handleSearch');
        const node = enterText('just not sorry');

        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('cut');
        jest.runOnlyPendingTimers();
        expect(handleSearch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#resetState', () => {
    describe('on blur', () => {
      it('removes any existing warnings', () => {
        const spy = jest.spyOn(instance, 'resetState');

        const node = enterText('just not sorry');

        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('blur');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(wrapper.state('warnings').length).toEqual(0);
      });
    });
  });

  describe('#updateWarnings', () => {
    it('updates state and parentNode for a match', () => {
      const elem = enterText('test!!!');

      const domNode = elem.getDOMNode();
      instance.updateWarnings(domNode, [
        buildWarning('\\b!{3,}\\B', 'warning message'),
      ]);

      expect(wrapper.state('warnings').length).toBe(1);
      expect(wrapper.state('parentNode')).toBe(domNode.parentNode);
    });

    it('does not add warnings for tooltip matches', () => {
      const node = enterText('test justify test');
      const domNode = node.getDOMNode();
      const mockedMutation = { type: 'childList', target: domNode };
      const documentObserver = mutationObserverMock.mock.instances[0];
      documentObserver.trigger([mockedMutation]);

      node.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(wrapper.state('warnings').length).toBe(0);
    });
  });
});
