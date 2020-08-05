import { h } from 'preact';
import WarningHighlight from '../src/components/WarningHighlight.js';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

describe('<WarningHighlight/>', () => {
  let wrapper;

  const testProps = {
    style: {
      left: '10px',
      height: '3px',
      width: '25px',
    },
    message: 'test-message',
    position: 'test-position',
  };

  beforeEach(() => {
    wrapper = shallow(
      <WarningHighlight
        styles={testProps.style}
        message={testProps.message}
        position={testProps.position}
      />
    );
  });

  it('should return a highlight div', () => {
    expect(wrapper.type()).toBe('div');
    expect(wrapper.hasClass('jns-highlight')).toEqual(true);
  });

  it('should have the correct data and style attributes', () => {
    expect(wrapper.prop('data-tip')).toEqual('test-message');
    expect(wrapper.prop('data-place')).toEqual('test-position');
    expect(wrapper.prop('style')).toEqual({
      left: '10px',
      height: '3px',
      width: '25px',
    });
  });
});
