import React from 'react';
import WarningHighlight from '../src/components/WarningHighlight.js';
import { render, waitFor, screen } from '@testing-library/react';

describe('<WarningHighlight/>', () => {
  const testProps = {
    style: {
      left: '10px',
      height: '3px',
      width: '25px',
    },
    message: 'test-message',
  };

  beforeEach(() => {
    render(
      <WarningHighlight
        container={{
          left: 16,
          top: 152,
        }}
        bounds={{
          top: 202,
          left: 26,
          width: 25,
          height: 15,
        }}
        message={testProps.message}
      />
    );
  });

  it('should return a highlight div', async () => {
    await waitFor(() => {
      const jnsHighlights = screen.getAllByTestId('jns-highlight');
      expect(jnsHighlights.length).toBe(1);
      expect(jnsHighlights[0].tagName).toEqual('DIV');
    });
  });

  it('should have the correct data and style attributes', async () => {
    await waitFor(() => {
      const jnsHighlights = screen.getAllByTestId('jns-highlight');
      expect(jnsHighlights.length).toBe(1);
      const jnsHighlight = jnsHighlights[0];
      expect(jnsHighlight.tagName).toEqual('DIV');
      expect(jnsHighlight.dataset.tooltipContent).toEqual('test-message');
      expect(jnsHighlight).toHaveStyle('left: 10px; height: 3px; width: 25px;');
    });
  });
});
