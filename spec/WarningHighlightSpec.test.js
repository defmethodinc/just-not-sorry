import React from 'react';
import WarningHighlight from '../src/components/WarningHighlight.js';
import { fireEvent, render, screen } from '@testing-library/react';

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
        number={3}
        message={testProps.message}
      />,
    );
  });

  it('should return a highlight div', () => {
    const jnsHighlights = screen.getAllByTestId('jns-highlight');
    expect(jnsHighlights).toHaveLength(1);
    expect(jnsHighlights[0].tagName).toEqual('DIV');
  });

  it('should have the correct data and style attributes', () => {
    const jnsHighlights = screen.getAllByTestId('jns-highlight');
    expect(jnsHighlights).toHaveLength(1);
    const jnsHighlight = jnsHighlights[0];
    expect(jnsHighlight.tagName).toEqual('DIV');
    expect(jnsHighlight.dataset.tooltipId).toEqual('jns-highlight-3');
    expect(jnsHighlight.dataset.tooltipContent).toEqual('test-message');
    expect(jnsHighlight).toHaveStyle('left: 10px; height: 3px; width: 25px;');
  });

  it('should show the warning message in its tooltip', async () => {
    const jnsHighlight = screen.getByTestId('jns-highlight');

    fireEvent.mouseEnter(jnsHighlight);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveAttribute('id', 'jns-highlight-3');
    expect(tooltip).toHaveClass('jns-tooltip');
    expect(tooltip).toHaveTextContent('test-message');
  });
});
