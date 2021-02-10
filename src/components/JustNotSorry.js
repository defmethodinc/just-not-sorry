import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import PHRASES from '../warnings/phrases.json';
import domRegexpMatch from 'dom-regexp-match';
import { handleContentEditableContentInsert } from '../callbacks/ContentEditableInsert';
import { handleContentEditableChange } from '../callbacks/ContentEditableChange';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const OPTIONS = {
  characterData: false,
  subtree: true,
  childList: true,
  attributes: false,
};

class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      warnings: [],
    };

    this.documentObserver = new MutationObserver(
      handleContentEditableChange(this.applyEventListeners)
    );
    this.documentObserver.observe(document, { subtree: true, childList: true });

    this.messageObserver = new MutationObserver(
      handleContentEditableContentInsert
    );
  }

  updateState(newWarning) {
    this.setState((state) => ({
      warnings: state.warnings.concat(newWarning),
    }));
  }

  resetState = () => {
    // pass a function to ensure the call uses the updated version
    // eslint-disable-next-line no-unused-vars
    this.setState((state) => ({
      warnings: [],
    }));
  };

  createWarning = (pattern, phrase, message) => {
    return (match, range) => {
      const newWarning = {
        pattern: pattern.source,
        message: phrase.message,
        parentNode: message.parentNode,
        rangeToHighlight: range,
      };
      this.updateState(newWarning);
    };
  };

  search = (message, phrase) => {
    const pattern = new RegExp(phrase.pattern, 'ig');
    domRegexpMatch(
      message,
      pattern,
      this.createWarning(pattern, phrase, message)
    );
  };

  searchPhrases = (message) =>
    PHRASES.forEach((phrase) => this.search(message, phrase));

  requestSearch = (message) =>
    Util.debounce(() => {
      this.resetState();
      this.searchPhrases(message);
    }, WAIT_TIME_BEFORE_RECALC_WARNINGS);

  addObserver = (event) => {
    const message = event.target;
    this.messageObserver.observe(message, OPTIONS);

    this.searchPhrases(message);

    const searchMessage = this.requestSearch(message);
    message.addEventListener('focus', searchMessage);
    message.addEventListener('input', searchMessage);
  };

  removeObserver = (event) => {
    const message = event.target;
    this.messageObserver.disconnect();

    this.resetState();

    const searchMessage = this.requestSearch(message);
    message.removeEventListener('focus', searchMessage);
    message.removeEventListener('input', searchMessage);
    message.removeEventListener('focus', this.addObserver);
  };

  applyEventListeners = (mutation) => {
    mutation.target.addEventListener('focus', this.addObserver);
    mutation.target.addEventListener('blur', this.removeObserver);
  };

  render() {
    return (
      <div className="jns-warnings-list">
        {this.state.warnings.map((warning) =>
          ReactDOM.createPortal(
            <Warning key={warning.pattern} value={warning} />,
            warning.parentNode
          )
        )}
      </div>
    );
  }
}

export default JustNotSorry;
