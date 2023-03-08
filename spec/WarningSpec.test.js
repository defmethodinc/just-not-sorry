import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import Warning from '../src/components/Warning.js';

describe('<Warning/>', () => {
  it('should not return a warning div', async () => {
    render(<Warning textArea={null} />);
    await waitFor(() => {
      const jnsWarnings = screen.queryAllByTestId('jns-warning');
      expect(jnsWarnings.length).toBe(0);
    });
  });

  it('should return a warning div', async () => {
    const rangeToHighlight = {
      setStart: jest.fn(),
      setEnd: jest.fn(),
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
      getClientRects: jest.fn(() => []),
    };

    render(
      <Warning
        textArea={{}}
        range={rangeToHighlight}
        message={'test-message'}
      />
    );
    await waitFor(() => {
      const jnsWarnings = screen.getAllByTestId('jns-warning');
      expect(jnsWarnings.length).toBe(1);
      expect(jnsWarnings[0].tagName).toEqual('DIV');
    });
  });
});
