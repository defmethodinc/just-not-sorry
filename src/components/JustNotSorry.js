import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Warning from './Warning.js';
import * as Util from '../helpers/util.js';
import PHRASES from '../warnings/phrases.json';
import { forEachUniqueContentEditable } from '../callbacks/ContentEditableDiv';
import { findRanges } from '../helpers/RangeFinder';

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'gi'),
  message: phrase.message,
}));

const WATCH_FOR_NEW_NODES = {
  subtree: true,
  childList: true,
};

const textNodeIterator = (node) =>
  document.createNodeIterator(node, NodeFilter.SHOW_TEXT);

const JustNotSorry = ({ onEvents }) => {
  const [observer, setObserver] = useState(null);
  const [state, setState] = useState({ warnings: [], parentNode: {} });
  const resetState = () => setState({ warnings: [], parentNode: {} });

  const applyEventListeners = ({ target }) => {
    const searchHandler = handleSearch(target, MESSAGE_PATTERNS);
    for (let i = 0; i < onEvents.length; i++) {
      target.addEventListener(onEvents[i], searchHandler);
    }
    target.addEventListener('blur', resetState);
  };

  useEffect(() => {
    if (observer) return;

    const callback = forEachUniqueContentEditable(applyEventListeners);
    const obs = new MutationObserver(callback);
    obs.observe(document.body, WATCH_FOR_NEW_NODES);
    setObserver(obs);
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [
    forEachUniqueContentEditable,
    applyEventListeners,
    setObserver,
    observer,
  ]);

  const updateWarnings = (email, patterns) => {
    if (!email || !email.offsetParent) return resetState();

    const iter = textNodeIterator(email);
    const updatedWarnings = [];
    let nextNode;
    while ((nextNode = iter.nextNode()) !== null) {
      updatedWarnings.push(...findRanges(nextNode, patterns));
    }

    const updatedParent =
      state.parentNode.id !== email.offsetParent.id
        ? email.offsetParent
        : state.parentNode;

    setState({
      warnings: updatedWarnings,
      parentNode: updatedParent,
    });
  };

  const handleSearch = (email, patterns) => {
    return Util.debounce(() => updateWarnings(email, patterns), Util.WAIT_TIME);
  };

  if (state.warnings.length > 0) {
    const parentRect = state.parentNode.getBoundingClientRect();
    const warningComponents = state.warnings.map((warning, index) => (
      <Warning key={index} parentRect={parentRect} value={warning} />
    ));
    return ReactDOM.createPortal(warningComponents, state.parentNode);
  }
};

JustNotSorry.defaultProps = {
  onEvents: ['input', 'focus', 'cut'],
};
export default JustNotSorry;
