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
    this.state = {
      email: undefined,
      warnings: [],
    };
    this.applyEventListeners = this.applyEventListeners.bind(this);
    this.resetState = this.resetState.bind(this);
    this.searchEmail = this.searchEmail.bind(this);
    this.search = this.search.bind(this);

    this.handleSearch = Util.debounce(
      this.searchEmail,
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );

    this.documentObserver = new MutationObserver(
      ifEmailModified(this.applyEventListeners)
    );
    this.documentObserver.observe(document.body, WATCH_FOR_NEW_NODES);
  }

  resetState() {
    this.setState({ warnings: [] });
  }

  search(phrase) {
    return Util.match(this.state.email, phrase.regex).map((range) => ({
      message: phrase.message,
      parentNode: this.state.email.parentNode,
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
    if (this.state.email) {
      this.state.email.removeEventListener('input', this.handleSearch);
      this.state.email.removeEventListener('focus', this.handleSearch);
      this.state.email.removeEventListener('blur', this.resetState);
    }

    const email = mutation.target;
    email.addEventListener('input', this.handleSearch);
    email.addEventListener('focus', this.handleSearch);
    email.addEventListener('blur', this.resetState);
    this.setState({ email });
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
