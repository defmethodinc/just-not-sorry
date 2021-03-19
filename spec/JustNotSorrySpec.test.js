import { h } from 'preact';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

document.createRange = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
  startContainer: 'test',
  getClientRects: jest.fn(() => [{}]),
}));

const buildWarning = (pattern, message) => ({
  regex: new RegExp(pattern, 'ig'),
  message,
});

describe('JustNotSorry', () => {
  jest.useFakeTimers();
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

  const generateEditableDiv = (props, innerHtml) => {
    const divNode = mount(
      <div {...props} contentEditable={'true'}>
        {innerHtml ? innerHtml : ''}
      </div>
    );
    return divNode;
  };

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
    describe('on focus', () => {
      it('checks for warnings', () => {
        const handleSearch = jest.spyOn(instance, 'handleSearch');

        const node = generateEditableDiv(
          {
            id: 'div-focus',
          },
          'just not sorry'
        );
        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('focus');
        jest.runOnlyPendingTimers();

        expect(handleSearch).toHaveBeenCalledTimes(1);
        expect(wrapper.state('warnings').length).toEqual(2);
      });

      it('does nothing when given an empty string', () => {
        const handleSearch = jest.spyOn(instance, 'handleSearch');

        const node = generateEditableDiv({ id: 'some-id' });

        const domNode = node.getDOMNode();
        const mockedMutation = { type: 'childList', target: domNode };
        const documentObserver = mutationObserverMock.mock.instances[0];
        documentObserver.trigger([mockedMutation]);

        node.simulate('focus');
        jest.runOnlyPendingTimers();

        expect(handleSearch).toHaveBeenCalledTimes(1);
        expect(wrapper.state('warnings').length).toEqual(0);
      });
    });

    describe('on input', () => {
      it('updates warnings each time input is triggered', () => {
        const handleSearch = jest.spyOn(instance, 'handleSearch');
        const node = generateEditableDiv({ id: 'test' }, 'just not sorry');

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
        const node = generateEditableDiv({ id: 'test' }, 'just not sorry');

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

        const node = generateEditableDiv(
          {
            id: 'div-focus',
          },
          'just not sorry'
        );

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
      const elem = generateEditableDiv({ id: 'meaningless-id' }, 'test!!!');

      const domNode = elem.getDOMNode();
      instance.updateWarnings(domNode, [
        buildWarning('\\b!{3,}\\B', 'warning message'),
      ]);

      expect(wrapper.state('warnings').length).toBe(1);
      expect(wrapper.state('parentNode')).toBe(domNode.parentNode);
    });

    it('does not add warnings for tooltip matches', () => {
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

      const node = generateEditableDiv({ id: 'div-3' }, 'test justify test');
      const domNode = node.getDOMNode();
      const mockedMutation = { type: 'childList', target: domNode };
      const documentObserver = mutationObserverMock.mock.instances[0];
      documentObserver.trigger([mockedMutation]);

      node.simulate('focus');
      jest.runOnlyPendingTimers();

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });
  });
});
