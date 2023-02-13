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

const JustNotSorry = ({ phrases, onEvents }) => {
  const [observer, setObserver] = useState(null);
  const [state, setState] = useState({ warnings: [], parentNode: null });

  const clearWarnings = () => setState({ warnings: [], parentNode: null });

  const applyEventListeners = ({ target }) => {
    const searchHandler = handleSearch(target, phrases);
    for (let i = 0; i < onEvents.length; i++) {
      target.addEventListener(onEvents[i], searchHandler);
    }
    target.addEventListener('blur', clearWarnings);
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
    if (!email || !email.offsetParent) return clearWarnings();

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
  if (parentNode != null && warnings.length > 0) {
    const warningComponents = warnings.map((warning, index) => (
      <Warning
        key={index}
        container={parentNode}
        message={warning.message}
        rangeToHighlight={warning.rangeToHighlight}
      />
    ));
    return ReactDOM.createPortal(warningComponents, parentNode);
  }
};

JustNotSorry.defaultProps = {
  phrases: [],
  onEvents: ['input', 'focus', 'cut'],
};
export default JustNotSorry;
