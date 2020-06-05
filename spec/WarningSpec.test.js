import { h } from 'preact';
import Warning, {
  /*highlightStyles, setNodeStyle,*/ calculateCoords,
} from '../src/components/Warning.js';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

const parent = document.createElement('div');

parent.getBoundingClientRect = jest.fn(() => ({
  bottom: 591,
  height: 439,
  left: 26,
  right: 462,
  top: 152,
  width: 436,
  x: 26,
  y: 152,
}));

document.createRange = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
  getClientRects: jest.fn(() => [
    {
      bottom: 217,
      height: 15,
      left: 26,
      right: 65,
      top: 202,
      width: 39,
      x: 26,
      y: 202,
    },
  ]),
}));

const range = document.createRange();

describe('<Warning/>', () => {
  let wrapper;

  const testProps = {
    key: 'test-key',
    value: {
      keyword: 'test-keyword',
      message: 'test-message',
      parentNode: parent,
      rangeToHighlight: range,
    },
  };

  beforeEach(() => {
    wrapper = shallow(<Warning value={testProps.value} key={testProps.key} />);
  });

  it('should return a warning div', () => {
    expect(wrapper.type()).toBe('div');
    expect(wrapper.hasClass('jns-warning')).toEqual(true);
  });
});

describe('#calculateCoords', () => {
  it('should return undefined if the parentNode or rangeToHighlight are invalid', () => {
    expect(calculateCoords(null, null)).toEqual(undefined);
    expect(calculateCoords(undefined, undefined)).toEqual(undefined);
  });

  it('should return valid coords when both parentNode and rangeToHighlight are valid', () => {
    const parentNode = parent;
    const rangeToHighlight = range;
    console.log(calculateCoords(parentNode, rangeToHighlight));
    expect(calculateCoords(parentNode, rangeToHighlight)).toEqual({
      top: 65,
      left: 0,
    });
  });
});

describe('#highlightStyles', () => {});

describe('#setNodeStyles', () => {});
