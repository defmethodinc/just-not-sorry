import { h } from 'preact';
import WarningHighlight from '../src/components/WarningHighlight.js';

describe('WarningHighlight', () => {
  const props = {
    styles: 'test-style',
    message: 'test-message',
  };
  const highlight = (
    <WarningHighlight styles={props.styles} message={props.message} />
  );
  it('should return a highlight component', () => {
    expect(highlight.type.name).toBe('Highlight');
  });
});
