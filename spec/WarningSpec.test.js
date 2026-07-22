import React from 'react';
import { render, screen } from '@testing-library/react';
import Warning from '../src/components/Warning.js';

describe('<Warning/>', () => {
  it('should not return a warning div', () => {
    render(<Warning textArea={null} />);
    expect(screen.queryAllByTestId('jns-warning')).toHaveLength(0);
  });

  it('should return a warning div', () => {
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
      />,
    );
    const jnsWarnings = screen.getAllByTestId('jns-warning');
    expect(jnsWarnings).toHaveLength(1);
    expect(jnsWarnings[0].tagName).toEqual('DIV');
  });
});
