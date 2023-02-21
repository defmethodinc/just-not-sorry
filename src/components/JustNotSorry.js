import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Warning from './Warning.js';
import * as Util from '../helpers/util.js';
import { forEachUniqueContentEditable } from '../callbacks/ContentEditableDiv';
import { findRanges } from '../helpers/RangeFinder';

const JustNotSorry = ({ onEvents, phrases }) => {
  const email = useRef(null);
  const [observer, setObserver] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const hideWarnings = () => setWarnings([]);

  const showWarnings = (target) => {
    email.current = target;
    setWarnings(findRanges(target, phrases));
  };

  const applyEventListeners = ({ target }) => {
    const searchHandler = Util.debounce(
      () => showWarnings(target),
      Util.WAIT_TIME
    );
    onEvents.map((onEvent) => target.addEventListener(onEvent, searchHandler));
    target.addEventListener('blur', hideWarnings);
  };

  useEffect(() => {
    if (observer) return;

    const callback = forEachUniqueContentEditable(applyEventListeners);
    const obs = new MutationObserver(callback);
    obs.observe(document.body, {
      subtree: true,
      childList: true,
    });
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
  phrases: [],
};
export default JustNotSorry;
