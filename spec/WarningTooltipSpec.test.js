import { h } from 'preact';
import WarningTooltip from '../src/components/WarningTooltip.js';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

describe('WarningTooltip', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<WarningTooltip />)
  })

  it('should return a react-tooltip component', () => {
    expect(wrapper.type().name).toBe('ReactTooltip');
  });

  it('should have the default style attributes', () => {
    expect(wrapper.prop('type')).toEqual('dark');
    expect(wrapper.prop('effect')).toEqual('float');
  })
});
