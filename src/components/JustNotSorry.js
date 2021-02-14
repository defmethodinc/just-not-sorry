import { h, Component } from 'preact';
import ReactDOM from 'react-dom';
import Warning from './Warning.js';
import * as Util from './util.js';
import PHRASES from '../warnings/phrases.json';
import { ifEmailModified } from '../callbacks/ContentEditableDiv.js';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'gi'),
  message: phrase.message,
}));

const WATCH_FOR_NEW_NODES = {
  subtree: true,
  childList: true,
};

class JustNotSorry extends Component {
  constructor(props) {
    super(props);
    this.applyEventListeners = this.applyEventListeners.bind(this);
    this.resetState = this.resetState.bind(this);
    this.searchEmail = this.searchEmail.bind(this);
    this.search = this.search.bind(this);

    this.email = undefined;
    this.handleSearch = Util.debounce(
      this.searchEmail,
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
    this.state = {
      warnings: [],
    };
    this.documentObserver = new MutationObserver(
      ifEmailModified(this.applyEventListeners)
    );
    this.documentObserver.observe(document.body, WATCH_FOR_NEW_NODES);
  }

  resetState() {
    this.setState({ warnings: [] });
  }

  search(phrase) {
    return Util.match(this.email, phrase.regex).map((range) => ({
      message: phrase.message,
      parentNode: this.email.parentNode,
      rangeToHighlight: range,
    }));
  }

  searchEmail() {
    const newWarnings = [];
    for (let i = 0; i < MESSAGE_PATTERNS.length; i++) {
      const warnings = this.search(MESSAGE_PATTERNS[i]);
      if (warnings.length > 0) {
        newWarnings.push(...warnings);
      }
    }
    this.setState({ warnings: newWarnings });
  }

  applyEventListeners(mutation) {
    if (this.email) {
      this.email.removeEventListener('input', this.handleSearch);
      this.email.removeEventListener('focus', this.handleSearch);
      this.email.removeEventListener('blur', this.resetState);
    }

    this.email = mutation.target;
    this.email.addEventListener('input', this.handleSearch);
    this.email.addEventListener('focus', this.handleSearch);
    this.email.addEventListener('blur', this.resetState);
  }

  render() {
    return this.state.warnings.map((warning, index) =>
      ReactDOM.createPortal(
        <Warning key={index} value={warning} />,
        warning.parentNode
      )
    );
  }
}

export default JustNotSorry;
