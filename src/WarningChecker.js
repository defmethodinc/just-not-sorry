import domRegexpMatch from 'dom-regexp-match';
import HighlightGenerator from './HighlightGenerator.js';
import fastdom from 'fastdom';
import fastdomPromised from 'fastdom/extensions/fastdom-promised';

const myFastdom = fastdom.extend(fastdomPromised);

class WarningChecker {
  constructor(options) {
    options || (options = {});
    this.warnings = options.warnings || [];
    this.warningClass = options.warningClass || 'jns-warning';
  }

  addWarning(node, keyword, message) {
    const pattern = new RegExp('\\b(' + keyword + ')\\b', 'ig');
    const promises = [];
    const warningClass = this.warningClass;
    const promisifiedMatchCallback = function (match, range) {
      const matchPromise = HighlightGenerator.highlightMatches(
        message,
        warningClass
      ).call(node, match, range);
      promises.push(matchPromise);
    };
    domRegexpMatch(node, pattern, promisifiedMatchCallback);
    return Promise.all(promises);
  }

  addWarnings(node) {
    return Promise.all(
      this.warnings.map((warning) => {
        return this.addWarning(node, warning.keyword, warning.message);
      })
    );
  }

  removeWarnings(node) {
    const elementsToRemove = document.getElementsByClassName(this.warningClass);
    return myFastdom.mutate(function () {
      for (var i = elementsToRemove.length; i--; ) {
        node.removeChild(elementsToRemove[i]);
      }
    });
  }
}

export default WarningChecker;
