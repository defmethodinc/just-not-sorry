import { h } from 'preact';
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'preact/hooks';
import Warning from './Warning.js';
import * as Util from '../helpers/util.js';
import { forEachUniqueContentEditable } from '../callbacks/ContentEditableDiv';
import { findRanges } from '../helpers/RangeFinder';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const WATCH_FOR_NEW_NODES = {
  subtree: true,
  childList: true,
};

const findWarnings = () => document.getElementsByClassName('jns-warning');
const hide = (elem) => elem.setAttribute('hidden', true);
const show = (elem) => elem.removeAttribute('hidden');

const hideWarnings = () => {
  const warnings = findWarnings();
  for (let i = 0; i < warnings.length; i++) {
    hide(warnings[i]);
  }
};
const showWarnings = (onloadHandler) => {
  return () => {
    const warnings = findWarnings();
    if (warnings.length > 0) {
      for (let i = 0; i < warnings.length; i++) {
        show(warnings[i]);
      }
    } else {
      onloadHandler();
    }
  };
};

const JustNotSorry = ({ phrases, onEvents }) => {
  const [observer, setObserver] = useState(null);
  const [state, setState] = useState({ warnings: [], parentNode: null });

  const applyEventListeners = ({ target }) => {
    const searchHandler = handleSearch(target, phrases);
    for (let i = 0; i < onEvents.length; i++) {
      target.addEventListener(onEvents[i], searchHandler);
    }
    target.addEventListener('blur', hideWarnings);
    target.addEventListener('focus', showWarnings(searchHandler));
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
    if (!email || !email.offsetParent) return hideWarnings();

    setState({
      warnings: findRanges(email, patterns),
      parentNode: email.offsetParent,
    });
  };

  const handleSearch = (email, patterns) => {
    return Util.debounce(
      () => updateWarnings(email, patterns),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  };

  const { parentNode, warnings } = state;
  if (parentNode != null && warnings.size > 0) {
    const warningComponents = [];
    // eslint-disable-next-line no-unused-vars
    for (let [message, values] of warnings) {
      for (let i = 0; i < values.length; i++) {
        const range = values[i];
        const parentElement = range.startContainer.parentElement;
        const key = `${parentElement?.offsetTop ?? 0 + range.startOffset}x${
          parentElement?.offsetLeft ?? 0 + range.endOffset
        }`;

        warningComponents.push(
          <Warning
            key={key}
            container={parentNode}
            message={message}
            rangeToHighlight={values[i]}
          />
        );
      }
    }
    return ReactDOM.createPortal(warningComponents, parentNode);
  }
};

JustNotSorry.defaultProps = {
  phrases: [],
  onEvents: ['input', 'focus', 'cut'],
};
export default JustNotSorry;
