import WarningTooltip from '../src/components/WarningTooltip.js';

describe('WarningTooltip', () => {
  it('should return a react-tooltip component', () => {
    const tooltip = WarningTooltip();
    expect(tooltip.type.name).toBe('ReactTooltip');
  });
});
