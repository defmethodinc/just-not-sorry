import React from 'react';
import * as ReactDOM from 'react-dom/client';
import 'react-tooltip/dist/react-tooltip.css';
import JustNotSorry from './components/JustNotSorry';
import PHRASES from './warnings/phrases.json';

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'gi'),
  message: phrase.message,
}));

ReactDOM.hydrateRoot(
  document.body,
  <JustNotSorry
    phrases={MESSAGE_PATTERNS}
    onEvents={['input', 'focus', 'cut']}
  />
);
