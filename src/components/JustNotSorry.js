import { h, Component } from 'preact';
import ReactDOM from 'react-dom';

import Warning from './Warning.js';
import * as Util from './util.js';
import PHRASES from '../warnings/phrases.json';
import domRegexpMatch from 'dom-regexp-match';
import {
  handleKeyPress,
  handleCarriageReturn,
} from '../callbacks/ContentEditableDiv.js';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const OPTIONS = {
  characterData: false,
  subtree: true,
  childList: true,
  attributes: false,
};

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'ig'),
  message: phrase.message,
}));

class JustNotSorry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      warnings: [],
    };

    this.applyEventListeners = this.applyEventListeners.bind(this);
    this.addObserver = this.addObserver.bind(this);
    this.removeObserver = this.removeObserver.bind(this);
    this.searchPhrases = this.searchPhrases.bind(this);

    this.documentObserver = new MutationObserver(
      handleKeyPress(this.applyEventListeners)
    );
    this.documentObserver.observe(document, { subtree: true, childList: true });
    this.messageObserver = new MutationObserver(handleCarriageReturn);
  }

  updateState(newWarning) {
    this.setState((state) => ({
      warnings: state.warnings.concat(newWarning),
    }));
  }

  resetState() {
    // pass a function to ensure the call uses the updated version
    // eslint-disable-next-line no-unused-vars
    this.setState((state) => ({
      warnings: [],
    }));
  }

  createWarning(email, phrase) {
    return (match, range) => {
      const newWarning = {
        pattern: phrase.regex.source,
        message: phrase.message,
        parentNode: email.parentNode,
        rangeToHighlight: range,
      };
      this.updateState(newWarning);
    };
  }

  search(email, phrase) {
    domRegexpMatch(email, phrase.regex, this.createWarning(email, phrase));
  }

  searchPhrases(email) {
    MESSAGE_PATTERNS.forEach((phrase) => this.search(email, phrase));
  }

  requestSearch(anEmail) {
    return Util.debounce(() => {
      this.searchPhrases(anEmail);
    }, WAIT_TIME_BEFORE_RECALC_WARNINGS);
  }

  addObserver(event) {
    const thisEmail = event.target;
    this.messageObserver.observe(thisEmail, OPTIONS);

    this.searchPhrases(thisEmail);

    const searchMessage = this.requestSearch(thisEmail);
    thisEmail.addEventListener('focus', searchMessage);
    thisEmail.addEventListener('input', searchMessage);
  }

  removeObserver(event) {
    const thisEmail = event.target;
    this.messageObserver.disconnect();

    this.resetState();

    const searchMessage = this.requestSearch(thisEmail);
    thisEmail.removeEventListener('focus', searchMessage);
    thisEmail.removeEventListener('input', searchMessage);
    thisEmail.removeEventListener('focus', this.addObserver);
  }

  applyEventListeners(mutation) {
    mutation.target.addEventListener('focus', this.addObserver);
    mutation.target.addEventListener('blur', this.removeObserver);
  }

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
