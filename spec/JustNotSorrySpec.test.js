import { h } from 'preact';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

const mutationObserverMock = jest.fn(function MutationObserver(callback) {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
  this.trigger = (mockedMutationList) => {
    callback(mockedMutationList, this);
  };
});
global.MutationObserver = mutationObserverMock;

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

const buildWarning = (pattern, message) => ({ pattern, message });
describe('JustNotSorry', () => {
  let justNotSorry;
  let wrapper;
  let instance;
  const divsForCleanUp = [];

  beforeEach(() => {
    justNotSorry = mount(<JustNotSorry />);
    wrapper = justNotSorry;
    instance = justNotSorry.instance();
  });

  afterEach(() => {
    divsForCleanUp.forEach((divNode) => divNode.unmount());
    divsForCleanUp.length = 0;
    justNotSorry.unmount();
  });

  const generateEditableDiv = (props, innerHtml) => {
    const divNode = mount(
      <div {...props} contentEditable={'true'}>
        {innerHtml ? innerHtml : ''}
      </div>
    );
    divsForCleanUp.push(divNode);
    return divNode;
  };

  describe('#addObserver', () => {
    it('adds an observer that listens for structural changes to the content editable div', () => {
      const spy = jest.spyOn(instance, 'addObserver');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.addObserver.bind(instance),
      });
      node.simulate('focus');

      // There should be the document observer and the observer specifically for the target div
      const observerInstances = mutationObserverMock.mock.instances;
      const observerInstance = observerInstances[observerInstances.length - 1];

      expect(observerInstances.length).toBe(2);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(observerInstance.observe).toHaveBeenCalledWith(node.getDOMNode(), {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true,
      });
    });

    it('starts checking for warnings', () => {
      const spy = jest.spyOn(instance, 'checkForWarnings');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.addObserver.bind(instance),
      });
      node.simulate('focus');

      expect(spy).toHaveBeenCalled();
    });

    it('adds warnings to the content editable div', () => {
      const spy = jest.spyOn(instance, 'addWarnings');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.addObserver.bind(instance),
      });
      node.simulate('focus');

      expect(spy).toHaveBeenCalledWith(node.getDOMNode().parentNode);
    });
  });

  describe('#removeObserver', () => {
    it('removes any existing warnings', () => {
      const spy = jest.spyOn(instance, 'removeObserver');
      const node = generateEditableDiv(
        {
          id: 'div-focus',
          onFocus: instance.addObserver.bind(instance),
          onBlur: instance.removeObserver.bind(instance),
        },
        'just not sorry'
      );
      node.simulate('focus');

      expect(justNotSorry.state('warnings').length).toEqual(2);

      // remount the node
      node.mount();
      node.simulate('blur');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(justNotSorry.state('warnings').length).toEqual(0);

      node.unmount();
    });

    it('no longer checks for warnings on input events', () => {
      justNotSorry.unmount();
      justNotSorry.mount();
      const node = generateEditableDiv({
        id: 'div-remove',
        onFocus: instance.addObserver.bind(instance),
        onBlur: instance.removeObserver.bind(instance),
      });
      node.simulate('focus');
      node.simulate('blur');

      const spy = jest.spyOn(instance, 'checkForWarnings');

      node.simulate('input');

      expect(spy).not.toHaveBeenCalled();

      node.unmount();
    });

    it('disconnects the observer', () => {
      const spy = jest.spyOn(instance, 'removeObserver');
      const node = generateEditableDiv({
        id: 'div-disconnect',
        onFocus: instance.addObserver.bind(instance),
        onBlur: instance.removeObserver.bind(instance),
      });
      node.simulate('focus');
      node.simulate('blur');

      // There should be the document observer and the observer specifically for the target div
      const observerInstances = mutationObserverMock.mock.instances;
      const observerInstance = observerInstances[observerInstances.length - 1];

      expect(spy).toHaveBeenCalled();
      expect(observerInstance.disconnect).toHaveBeenCalled();

      node.unmount();
    });
  });

  describe('#addWarning', () => {
    it('adds a warning for a punctuation keyword', () => {
      const node = generateEditableDiv(
        { id: 'meaningless-id' },
        'test!!!'
      ).getDOMNode();

      instance.addWarning(node, {
        pattern: '\\b!{3,}\\B',
        message: 'warning message',
      });

      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          pattern: '\\b!{3,}\\B',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('adds a warning for a single keyword', () => {
      const node = generateEditableDiv(
        { id: 'meaningless-id' },
        'test just test'
      ).getDOMNode();

      instance.addWarning(node, buildWarning('just', 'warning message'));

      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          pattern: 'just',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('does not add warnings for partial matches', () => {
      const node = generateEditableDiv(
        { id: 'div-id' },
        'test justify test'
      ).getDOMNode();
      instance.addWarning(
        node,
        buildWarning('\\b(just)\\b', 'warning message')
      );

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });

    it('matches case insensitive', () => {
      const node = generateEditableDiv(
        { id: 'div-case' },
        'jUsT kidding'
      ).getDOMNode();

      instance.addWarning(node, buildWarning('just', 'warning message'));
      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          pattern: 'just',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('catches keywords with punctuation', () => {
      const node = generateEditableDiv(
        { id: 'div-punctuation' },
        'just. test'
      ).getDOMNode();

      instance.addWarning(node, buildWarning('just', 'warning message'));
      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          pattern: 'just',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('matches phrases', () => {
      const node = generateEditableDiv(
        { id: 'div-phrase' },
        'my cat is so sorry because of you'
      ).getDOMNode();

      instance.addWarning(node, buildWarning('so sorry', 'warning message'));
      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          pattern: 'so sorry',
          message: 'warning message',
          parentNode: node,
        })
      );
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

      const node = generateEditableDiv(
        { id: 'div-3' },
        'test justify test'
      ).getDOMNode();
      instance.addWarning(node, buildWarning('very', 'warning message'));

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });
  });

  describe('#addWarnings', () => {
    it('does nothing when given an empty string', () => {
      const node = generateEditableDiv({ id: 'some-id' });
      instance.addWarnings(node);

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });

    it('adds warnings to all keywords', () => {
      const node = generateEditableDiv(
        { id: 'div-keywords' },
        'I am just so sorry. Yes, just.'
      ).getDOMNode();

      instance.addWarnings(node);
      expect(wrapper.state('warnings').length).toEqual(3);
    });
  });

  describe('#checkForWarnings', () => {
    it('updates warnings each time input is triggered', () => {
      const spy = jest.spyOn(instance, 'checkForWarnings');
      const node = generateEditableDiv(
        { id: 'test', onInput: instance.checkForWarnings },
        'just not sorry'
      );

      node.simulate('input');
      node.simulate('input');
      node.simulate('input');
      expect(spy).toHaveBeenCalledTimes(3);
      node.unmount();
    });
  });

  describe('#handleContentEditableDivChange', () => {
    describe('when a new content editable div is added', () => {
      let spy;
      beforeEach(() => {
        spy = jest
          .spyOn(instance, 'applyEventListeners')
          .mockImplementationOnce(() => {});
      });

      it('should apply the event listeners', () => {
        const id = 'testing';
        const node = generateEditableDiv({ id }, 'just not sorry');
        const mockMutation = {
          type: 'childList',
          target: node.getDOMNode(),
        };

        instance.handleContentEditableDivChange([mockMutation]);

        expect(spy).toHaveBeenCalledWith(node.getDOMNode());
      });

      describe('and the new div does not have an id', () => {
        it('should still apply the event listeners', () => {
          const node = generateEditableDiv({}, 'just not sorry');
          const mockMutation = {
            type: 'childList',
            target: node.getDOMNode(),
          };

          instance.handleContentEditableDivChange([mockMutation]);

          expect(spy).toHaveBeenCalledWith(node.getDOMNode());
        });
      });
    });
  });

  describe('#handleContentEditableContentInsert', () => {
    let mockNode;
    beforeEach(() => {
      mockNode = {
        dispatchEvent: jest.fn(),
        hasAttribute: () => true,
      };
    });
    describe('when an observed content editable sees a non-text change (such as a line break)', () => {
      it('should dispatch an input event to trigger checking for warnings', () => {
        const mockMutation = {
          type: 'childList',
          target: mockNode,
        };

        instance.handleContentEditableContentInsert([mockMutation]);

        expect(mockNode.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
      });
    });

    describe('when an observed content editable sees a text change', () => {
      it('should NOT dispatch an extra input event', () => {
        const mockMutation = {
          type: 'characterData',
          target: mockNode,
        };

        instance.handleContentEditableContentInsert([mockMutation]);

        expect(mockNode.dispatchEvent).not.toHaveBeenCalled();
      });
    });
  });
});
