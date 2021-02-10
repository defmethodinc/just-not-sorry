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

  addPhrase = (pattern, warning, node) => {
    return (match, range) => {
      const newWarning = {
        pattern: pattern.source,
        message: warning.message,
        parentNode: node.parentNode,
        rangeToHighlight: range,
      };
      this.updateState(newWarning);
    };
  };

  search = (node, warning) => {
    const pattern = new RegExp(warning.pattern, 'ig');
    domRegexpMatch(node, pattern, this.addPhrase(pattern, warning, node));
  };

  searchPhrases = (node) =>
    PHRASES.forEach((phrase) => this.search(node, phrase));

  requestSearch = (node) =>
    Util.debounce(() => {
      this.resetState();
      this.searchPhrases(node);
    }, WAIT_TIME_BEFORE_RECALC_WARNINGS);

  addObserver = (event) => {
    const node = event.currentTarget;
    this.messageObserver.observe(node, OPTIONS);
    this.searchPhrases(node);
    const warningCheck = this.requestSearch(node);
    node.addEventListener('focus', warningCheck);
    node.addEventListener('input', warningCheck);
  };

  removeObserver = (event) => {
    this.messageObserver.disconnect();

    this.resetState();

    const node = event.currentTarget;

    const warningCheck = this.requestSearch(node);
    node.removeEventListener('focus', warningCheck);
    node.removeEventListener('input', warningCheck);
    node.removeEventListener('focus', this.addObserver);
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
