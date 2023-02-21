import React, { useState, useEffect, useRef } from 'react';
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
  const email = useRef(null);
  const [observer, setObserver] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const resetState = () => setWarnings([]);

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

  const updateWarnings = (target, patterns) => {
    if (!target || !target.offsetParent) return resetState();
    email.current = target;

    const iter = textNodeIterator(target);
    const updatedWarnings = [];
    let nextNode;
    while ((nextNode = iter.nextNode()) !== null) {
      updatedWarnings.push(...findRanges(nextNode, patterns));
    }

    setWarnings(updatedWarnings);
  };

  const handleSearch = (email, patterns) => {
    return Util.debounce(() => updateWarnings(email, patterns), Util.WAIT_TIME);
  };

  if (email.current !== null && warnings.length > 0) {
    const parentRect = email.current.offsetParent.getBoundingClientRect();
    const warningComponents = warnings.map((warning, index) => (
      <Warning key={index} parentRect={parentRect} value={warning} />
    ));
    return ReactDOM.createPortal(warningComponents, email.current.offsetParent);
  }
};

JustNotSorry.defaultProps = {
  onEvents: ['input', 'focus', 'cut'],
};
export default JustNotSorry;
