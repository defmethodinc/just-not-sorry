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
    position: 'test-position',
  };

  beforeEach(() => {
    render(
      <WarningHighlight
        styles={testProps.style}
        message={testProps.message}
        position={testProps.position}
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
      expect(jnsHighlight.style._values).toEqual({
        left: '10px',
        height: '3px',
        width: '25px',
      });
    });
  });
});
