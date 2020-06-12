import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import WARNING_MESSAGES from './WarningMessages.json';
import domRegexpMatch from 'dom-regexp-match';

export const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

export const getEditableDivs = () =>
  document.querySelectorAll('div[contentEditable=true]');

export const addWarning = (node, keyword, message, setWarnings) => {
  let newWarning;
  let warningItems = [];
  const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
  domRegexpMatch(node, pattern, (match, range) => {
    newWarning = {
      keyword: keyword,
      message: message,
      parentNode: node,
      rangeToHighlight: range,
    };
    warningItems.push(newWarning);
    setWarnings((prevState) => [...prevState, newWarning]);
  });
  return warningItems;
};

export const addWarnings = (node, setWarnings) => {
  let allWarnings = [];
  WARNING_MESSAGES.map((warning) => {
    const warningItems = addWarning(
      node,
      warning.keyword,
      warning.message,
      setWarnings
    );
    if (warningItems.length > 0) {
      allWarnings = [...allWarnings, warningItems];
    }
    return warningItems;
  });
  return allWarnings;
};

export default function JustNotSorry() {
  let documentObserver;
  let observer;
  let editableDivCount;

  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    documentObserver = new MutationObserver(
      handleContentEditableDivChange.bind(this)
    );
    observer = new MutationObserver(
      handleContentEditableContentInsert.bind(this)
    );
    initializeObserver();
  }, []);

  const initializeObserver = () => {
    documentObserver.observe(document, { subtree: true, childList: true });
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

  const handleContentEditableDivChange = (mutations) => {
    let divCount = getEditableDivs().length;
    if (divCount !== editableDivCount) {
      editableDivCount = divCount;
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

  const checkForWarnings = (parentElement) => {
    return Util.debounce(
      () => checkForWarningsImpl(parentElement),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  };

  const checkForWarningsImpl = (parentElement) => {
    setWarnings([]);
    addWarnings(parentElement, setWarnings);
  };

  const applyEventListeners = (id) => {
    let targetDiv = document.getElementById(id);
    targetDiv.removeEventListener('focus', addObserver);
    targetDiv.addEventListener('focus', addObserver.bind(this));
    targetDiv.addEventListener('blur', removeObserver.bind(this));
  };

  const addObserver = (event) => {
    const element = event.currentTarget;
    element.addEventListener('input', checkForWarnings(element.parentNode));
    setWarnings([]);
    addWarnings(element.parentNode, setWarnings);
    observer.observe(element, {
      characterData: false,
      subtree: true,
      childList: true,
      attributes: false,
    });
  };

  const removeObserver = (event) => {
    const element = event.currentTarget;
    setWarnings([]);
    element.removeEventListener('input', checkForWarnings);
    observer.disconnect();
  };

  const warningList = warnings.map((warning) =>
    ReactDOM.createPortal(
      <Warning class=".jns-warning" key={warning.keyword} value={warning} />,
      warning.parentNode
    )
  );

  return <div className=".jns-warnings-list">{warningList}</div>;
}
