import React from 'react';
import { render, waitFor } from '@testing-library/react';
import WarningTooltip from '../src/components/WarningTooltip.js';

describe('WarningTooltip', () => {
  it('should have the default style attributes', async () => {
    render(<WarningTooltip />);
    await waitFor(() => {
      const jnsTooltips = document.body.getElementsByClassName(
        '__react_component_tooltip'
      );
      expect(jnsTooltips.length).toBe(1);
      const jnsTooltip = jnsTooltips[0];
      expect(jnsTooltip.tagName).toEqual('DIV');
      expect(jnsTooltip.className).toContain('dark');
    });
  });
});
