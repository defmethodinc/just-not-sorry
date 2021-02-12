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

const buildWarning = (pattern, message) => ({
  regex: new RegExp(pattern, 'ig'),
  message,
});

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

  describe('#documentObserver', () => {
    it('adds a an observer that listens for structural changes to the content editable div from document body', () => {
      const spy = jest.spyOn(instance, 'searchEmail');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.searchEmail.bind(instance),
      });
      instance.email = node;

      node.simulate('focus');

      // There should be the document observer
      const observerInstances = mutationObserverMock.mock.instances;

      expect(observerInstances.length).toBe(1);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(observerInstances[0].observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    });

    it('starts checking for warnings', () => {
      const spy = jest.spyOn(instance, 'searchEmail');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.searchEmail.bind(instance),
      });
      instance.email = node;
      node.simulate('focus');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#blur action', () => {
    it('removes any existing warnings', () => {
      const spy = jest.spyOn(instance, 'resetState');
      const node = generateEditableDiv(
        {
          id: 'div-focus',
          onFocus: instance.searchEmail,
          onBlur: instance.resetState,
        },
        'just not sorry'
      );
      instance.email = node.getDOMNode();

      node.simulate('focus');

      expect(wrapper.state('warnings').length).toEqual(2);

      // remount the node
      node.mount();
      node.simulate('blur');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(wrapper.state('warnings').length).toEqual(0);

      node.unmount();
    });

    it('no longer checks for warnings on input events', () => {
      justNotSorry.unmount();
      justNotSorry.mount();
      const node = generateEditableDiv({
        id: 'div-remove',
        onFocus: instance.searchEmail.bind(instance),
        onBlur: instance.resetState.bind(instance),
      });

      instance.email = node.getDOMNode();

      node.simulate('focus');
      node.simulate('blur');

      const spy = jest.spyOn(instance, 'searchEmail');

      node.simulate('input');

      expect(spy).not.toHaveBeenCalled();

      node.unmount();
    });
  });

  describe('#search', () => {
    it('adds a valid range for a punctuation keyword', () => {
      const node = generateEditableDiv(
        { id: 'meaningless-id' },
        'test!!!'
      ).getDOMNode();
      instance.email = node;

      const ranges = instance.search(
        buildWarning('\\b!{3,}\\B', 'warning message')
      );

      expect(ranges.length).toEqual(1);
      expect(ranges[0]).toEqual(
        expect.objectContaining({
          message: 'warning message',
          parentNode: node.parentNode,
        })
      );
    });

    it('adds a warning for a single keyword', () => {
      const node = generateEditableDiv(
        { id: 'meaningless-id' },
        'test just test'
      ).getDOMNode();
      instance.email = node;
      const ranges = instance.search(buildWarning('just', 'warning message'));

      expect(ranges.length).toEqual(1);
      expect(ranges[0]).toEqual(
        expect.objectContaining({
          message: 'warning message',
          parentNode: node.parentNode,
        })
      );
    });

    it('does not add warnings for partial matches', () => {
      const node = generateEditableDiv(
        { id: 'div-id' },
        'test justify test'
      ).getDOMNode();
      instance.email = node;

      const ranges = instance.search(
        buildWarning('\\b(just)\\b', 'warning message')
      );

      expect(ranges.length).toEqual(0);
      expect(ranges).toEqual([]);
    });

    it('matches case insensitive', () => {
      const node = generateEditableDiv(
        { id: 'div-case' },
        'jUsT kidding'
      ).getDOMNode();

      instance.email = node;
      const ranges = instance.search(buildWarning('just', 'warning message'));

      expect(ranges.length).toEqual(1);
      expect(ranges[0]).toEqual(
        expect.objectContaining({
          message: 'warning message',
          parentNode: node.parentNode,
        })
      );
    });

    it('catches keywords with punctuation', () => {
      const node = generateEditableDiv(
        { id: 'div-punctuation' },
        'just. test'
      ).getDOMNode();

      instance.email = node;
      const ranges = instance.search(buildWarning('just', 'warning message'));
      expect(ranges.length).toEqual(1);
      expect(ranges[0]).toEqual(
        expect.objectContaining({
          message: 'warning message',
          parentNode: node.parentNode,
        })
      );
    });

    it('matches phrases', () => {
      const node = generateEditableDiv(
        { id: 'div-phrase' },
        'my cat is so sorry because of you'
      ).getDOMNode();
      instance.email = node;
      const ranges = instance.search(
        buildWarning('so sorry', 'warning message')
      );
      expect(ranges.length).toEqual(1);
      expect(ranges[0]).toEqual(
        expect.objectContaining({
          message: 'warning message',
          parentNode: node.parentNode,
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
      instance.email = node;
      instance.searchEmail();

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });
  });

  describe('#searchEmail', () => {
    it('does nothing when given an empty string', () => {
      instance.email = generateEditableDiv({ id: 'some-id' });

      instance.searchEmail();

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });

    it('adds warnings to all keywords', () => {
      instance.email = generateEditableDiv(
        { id: 'div-keywords' },
        'I am just so sorry. Yes, just.'
      ).getDOMNode();
      instance.searchEmail();
      expect(wrapper.state('warnings').length).toEqual(3);
    });

    it('updates warnings each time input is triggered', () => {
      const spy = jest.spyOn(instance, 'searchEmail');
      const node = generateEditableDiv(
        { id: 'test', onInput: instance.searchEmail },
        'just not sorry'
      );
      instance.email = node;

      node.simulate('input');
      node.simulate('input');
      node.simulate('input');

      expect(spy).toHaveBeenCalledTimes(3);
      node.unmount();
    });
  });
});
