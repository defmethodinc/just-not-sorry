import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Warning from './Warning.js';
import * as Util from '../helpers/util.js';
import { forEachUniqueContentEditable } from '../callbacks/ContentEditableDiv';
import { calculateWarnings } from '../helpers/RangeFinder';

const JustNotSorry = ({ onEvents, phrases }) => {
  const email = useRef(null);
  const [observer, setObserver] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const hideWarnings = () => setWarnings([]);

  const showWarnings = (target) => {
    email.current = target;
    setWarnings(calculateWarnings(target, phrases));
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

  if (email.current != null && warnings.length > 0) {
    const currentEmail = email.current;
    const parentRect = currentEmail.offsetParent.getBoundingClientRect();
    const warningComponents = warnings.map((warning, i) => {
      let key = i;

      if (currentEmail.offsetTop && currentEmail.offsetLeft) {
        key = `${currentEmail.offsetTop + warning.startOffset}x${
          currentEmail.offsetLeft + warning.endOffset
        }`;
      }
      if (warning?.startContainer?.parentElement) {
        const { offsetTop, offsetLeft } = warning.startContainer.parentElement;
        key = `${offsetTop + warning.startOffset}x${
          offsetLeft + warning.endOffset
        }`;
      }
      return (
        <Warning
          key={key}
          textArea={parentRect}
          range={warning.rangeToHighlight}
          message={warning.message}
          number={i}
        />
      );
    });
    return ReactDOM.createPortal(warningComponents, currentEmail.offsetParent);
  }
};

JustNotSorry.defaultProps = {
  onEvents: ['input', 'focus', 'cut'],
  phrases: [],
};
export default JustNotSorry;
