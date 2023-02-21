import React from 'react';
import * as ReactDOM from 'react-dom/client';
import 'react-tooltip/dist/react-tooltip.css';

import JustNotSorry from './components/JustNotSorry';

ReactDOM.hydrateRoot(
  document.body,
  <JustNotSorry onEvents={['input', 'focus', 'cut']} />
);
