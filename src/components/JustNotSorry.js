import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ReactDOM from 'react-dom';
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

const JustNotSorry = () => {
  const [parentNode, setParentNode] = useState({})
  const [warnings, setWarnings] = useState([])
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Run! Like go get some data from an API.
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if ("enabled" in changes) {
        setEnabled(changes.enabled.newValue)
      }
    });
  }, []);

  const resetState = () => {
    setParentNode({})
    setWarnings([])
  }

  const applyEventListeners = (mutation) => {
    const email = mutation.target;
    const searchHandler = handleSearch(email, MESSAGE_PATTERNS);
    email.addEventListener('input', searchHandler);
    email.addEventListener('focus', searchHandler);
    email.addEventListener('cut', searchHandler);
    email.addEventListener('blur', resetState);
  }

  const documentObserver = new MutationObserver(
      forEachUniqueContentEditable(applyEventListeners)
  );
  documentObserver.observe(document.body, WATCH_FOR_NEW_NODES);

  const updateWarnings = (email, patterns) => {
    if (!email || !email.offsetParent) {
      resetState();
      return;
    }
    const newWarnings =
        email.childNodes.length > 0
            ? Array.from(email.childNodes)
                .filter((node) => node.textContent !== '')
                .flatMap((text) => findRanges(text, patterns))
            : findRanges(email, patterns);
    setWarnings(newWarnings)

    if( parentNode.id !== email.offsetParent.id) {
      setParentNode(email.offsetParent)
    }
  }

  const handleSearch = (email, patterns) => {
    return Util.debounce(
        () => updateWarnings(email, patterns),
        WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  }

  if (enabled && warnings.length > 0) {
    const parentRect = parentNode.getBoundingClientRect();
    const w = warnings.map((warning, index) => (
        <Warning key={index} parentRect={parentRect} value={warning} />
    ));
    return ReactDOM.createPortal(w, parentNode);
  }
}

export default JustNotSorry;
