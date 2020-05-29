import { h } from 'preact';
import { useState, useEffect, useReducer } from 'preact/hooks';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNING_MESSAGES from './WarningMessages.json';
import domRegexpMatch from 'dom-regexp-match';

export var WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

export default function JustNotSorry() {
  let documentObserver;
  let observer;

  const [editableDivCount, setEditableDivCount] = useState(0);
  const [warnings, setWarnings] = useReducer((prevState, action) => {
    return action ? [...prevState, action] : [];
  }, []);

  useEffect(() => {
    documentObserver = new MutationObserver(
      handleContentEditableDivChange.bind(this)
    );
    observer = new MutationObserver(
      handleContentEditableContentInsert.bind(this)
    );
    initializeObserver();
  });

  const initializeObserver = () => {
    documentObserver.observe(document, { subtree: true, childList: true });
  };

  const addObserver = (event) => {
    const element = event.currentTarget;
    element.addEventListener('input', checkForWarnings(element.parentNode));
    removeWarnings();
    addWarnings(element.parentNode);
    observer.observe(element, {
      characterData: false,
      subtree: true,
      childList: true,
      attributes: false,
    });
  };

  const removeObserver = (event) => {
    const element = event.currentTarget;
    removeWarnings();
    element.removeEventListener('input', checkForWarnings);
    observer.disconnect();
  };

  const checkForWarnings = (parentElement) => {
    return Util.debounce(
      () => checkForWarningsImpl(parentElement),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  };

  const checkForWarningsImpl = (parentElement) => {
    removeWarnings();
    addWarnings(parentElement);
  };

  const applyEventListeners = (id) => {
    let targetDiv = document.getElementById(id);
    targetDiv.removeEventListener('focus', addObserver);
    targetDiv.addEventListener('focus', addObserver.bind(this));
    targetDiv.addEventListener('blur', removeObserver.bind(this));
  };

  const handleContentEditableDivChange = (mutations) => {
    let divCount = getEditableDivs().length;
    if (divCount !== editableDivCount) {
      setEditableDivCount(divCount);
      if (mutations[0]) {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'childList' &&
            mutation.target.hasAttribute('contentEditable')
          ) {
            let id = mutation.target.id;
            if (id) {
              applyEventListeners(id);
            }
          }
        });
      }
    }
  };

  const handleContentEditableContentInsert = (mutations) => {
    if (mutations[0]) {
      mutations.forEach((mutation) => {
        if (
          mutation.type !== 'characterData' &&
          mutation.target.hasAttribute('contentEditable')
        ) {
          let id = mutation.target.id;
          if (id) {
            let targetDiv = document.getElementById(id);
            // generate input event to fire checkForWarnings again
            let inputEvent = new Event('input', {
              bubbles: true,
              cancelable: true,
            });
            targetDiv.dispatchEvent(inputEvent);
          }
        }
      });
    }
  };

  const getEditableDivs = () =>
    document.querySelectorAll('div[contentEditable=true]');

  const addWarning = (node, keyword, message) => {
    const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
    domRegexpMatch(node, pattern, (match, range) => {
      let newWarning = {
        keyword: keyword,
        message: message,
        parentNode: node,
        rangeToHighlight: range,
      };

      setWarnings(newWarning);
    });
  };

  const addWarnings = (node) => {
    WARNING_MESSAGES.map((warning) => {
      addWarning(node, warning.keyword, warning.message);
    });
  };

  const removeWarnings = () => setWarnings();

  const warningList = warnings.map((warning) =>
    ReactDOM.createPortal(
      <Warning class=".jns-warning" key={warning.keyword} value={warning} />,
      warning.parentNode
    )
  );

  return <div className=".jns-warnings-list">{warningList}</div>;
}
