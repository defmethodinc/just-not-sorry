import * as Util from './util';

function search(element, phrase) {
  return Util.match(element, phrase.regex).map((range) => ({
    message: phrase.message,
    rangeToHighlight: range,
  }));
}

export function findRanges(node, patternsToFind) {
  return patternsToFind.flatMap((pattern) => search(node, pattern));
}
