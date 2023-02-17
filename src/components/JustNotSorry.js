// eslint-disable-next-line no-unused-vars
import { h } from 'preact';
import ReactDOM from 'react-dom';
import {useEffect, useRef, useState} from 'preact/hooks';
import * as Util from '../helpers/util.js';
import {forEachUniqueContentEditable} from '../callbacks/ContentEditableDiv';
import Warning from './Warning';

const JustNotSorry = ({ phrases, onEvents }) => {
  const warningContainer = useRef(null);
  const currentEmail = useRef(null);
  const [observer, setObserver] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const hideWarnings = () => {
    if (warningContainer.current) {
      warningContainer.current.style.visibility = 'hidden';
    }
  };

  const displayWarnings = ({target}) => {
    const current = warningContainer.current;
    if (current && current.dataset.emailId === target.id) {
      current.style.visibility = 'visible';
      return true;
    }
    return false
  }

  const displayOr = (elseAction) => (e) =>  {
    if(!displayWarnings(e)) {
      elseAction()
    }
  };

  const findWarnings = (target) => Util.debounce(() => search(target), Util.WAIT_TIME);

  const applyEventListeners = ({ target }) => {
    const updateWarnings = findWarnings(target);
    onEvents.forEach((event) => target.addEventListener(event, updateWarnings));
    target.addEventListener('blur', hideWarnings);
    target.addEventListener('focus', displayOr(updateWarnings));
  };

  useEffect(() => {
    if (observer) {
      return;
    }

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

  const textNodeIterator = (node) => document.createNodeIterator(node, NodeFilter.SHOW_TEXT);

  const search = (email) => {
    const warnings = [];
    const emailBounds = email.offsetParent.getBoundingClientRect();
    let textNode;
    const iter = textNodeIterator(email);
    while ((textNode = iter.nextNode()) !== null) {
      for (let i = 0; i < phrases.length; i++) {
        const {regex, message} = phrases[i];
        const ranges = Util.match(textNode, regex);
        for (let j = 0; j < ranges.length; j++) {
          const range = ranges[j];
          let key = `${email.offsetTop + range.startOffset}x${email.offsetLeft + range.endOffset}`;
          if(range.startContainer.parentElement){
            const {offsetTop, offsetLeft} = range.startContainer.parentElement;
            key = `${offsetTop + range.startOffset}x${offsetLeft + range.endOffset}`;
          }
          warnings.push(
              <Warning
                  key={key}
                  parentBounds={emailBounds}
                  message={message}
                  rangeToHighlight={range}
              />
          );
        }
      }
    }
    currentEmail.current = email;
    setWarnings(warnings);
  };

  if (warnings.length > 0) {
    const email = currentEmail.current;
    const component = (
        <div data-email-id={email.id} ref={warningContainer}>
          {warnings}
        </div>
    );
    return ReactDOM.createPortal(component, email.offsetParent);
  }
};

JustNotSorry.defaultProps = {
  phrases: [],
  onEvents: ['input', 'focus', 'cut'],
};
export default JustNotSorry;