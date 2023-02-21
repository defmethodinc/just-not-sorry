import React from 'react';
import * as ReactDOM from 'react-dom/client';

import JustNotSorry from './components/JustNotSorry';

ReactDOM.hydrateRoot(
  document.body,
  <JustNotSorry onEvents={['input', 'focus', 'cut']} />
);
