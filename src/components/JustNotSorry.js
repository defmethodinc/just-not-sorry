import { h } from 'preact';
import ReactDOM from 'react-dom';
import { useState } from 'preact/hooks';
import Warning from './Warning.js';
import * as Util from '../helpers/util.js';
import PHRASES from '../warnings/phrases.json';
import { forEachUniqueContentEditable } from '../callbacks/ContentEditableDiv';
import { findRanges } from '../helpers/RangeFinder';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'gi'),
  message: phrase.message,
}));

const WATCH_FOR_NEW_NODES = {
  subtree: true,
  childList: true,
};

const JustNotSorry = ({ onEvents }) => {
  const [state, setState] = useState({ warnings: [], parentNode: {} });

  const resetState = () => {
    setState({ warnings: [], parentNode: {} });
  };

  const updateWarnings = (email, patterns) => {
    if (!email || !email.offsetParent) {
      return resetState();
    }

    const newWarnings =
      email.childNodes.length > 0
        ? Array.from(email.childNodes)
            .filter((n) => n.textContent !== '')
            .flatMap((n) => findRanges(n, patterns))
        : findRanges(email, patterns);

    const nextParent =
      state.parentNode.id !== email.offsetParent.id
        ? email.offsetParent
        : state.parentNode;
    setState({
      warnings: newWarnings,
      parentNode: nextParent,
    });
  };

  const handleSearch = (email, patterns) => {
    return Util.debounce(
      () => updateWarnings(email, patterns),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  };

  const applyEventListeners = (mutation) => {
    const email = mutation.target;
    const searchHandler = handleSearch(email, MESSAGE_PATTERNS);
    for (let i = 0; i < onEvents.length; i++) {
      email.addEventListener(onEvents[i], searchHandler);
    }
    email.addEventListener('blur', resetState);
  };

  const documentObserver = new MutationObserver(
    forEachUniqueContentEditable(applyEventListeners)
  );
  documentObserver.observe(document.body, WATCH_FOR_NEW_NODES);

  if (state.warnings.length > 0) {
    const parentRect = state.parentNode.getBoundingClientRect();
    const w = state.warnings.map((warning, index) => (
      <Warning key={index} parentRect={parentRect} value={warning} />
    ));
    return ReactDOM.createPortal(w, state.parentNode);
  }
};

JustNotSorry.defaultProps = {
  onEvents: ['input', 'focus', 'cut'],
};
export default JustNotSorry;
