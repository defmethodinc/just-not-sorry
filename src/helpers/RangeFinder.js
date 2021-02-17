import * as Util from './util';

function search(email, phrase) {
  return Util.match(email, phrase.regex).map((range) => ({
    message: phrase.message,
    rangeToHighlight: range,
  }));
}

export function findRanges(element, patternsToFind) {
  const newWarnings = [];
  for (let i = 0; i < patternsToFind.length; i++) {
    const warnings = search(element, patternsToFind[i]);
    newWarnings.push(...warnings);
  }
  return newWarnings;
}
