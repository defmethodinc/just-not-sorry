import { h, render } from 'preact';
import PHRASES from './warnings/phrases.json';
import JustNotSorry from './components/JustNotSorry';

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'gi'),
  message: phrase.message,
}));

render(
  <JustNotSorry
    phrases={MESSAGE_PATTERNS}
    onEvents={['input', 'focus', 'cut']}
  />,
  document.body
);
