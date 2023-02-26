import * as Util from './util';

function search(element, phrase) {
  return Util.match(element, phrase.regex).map((range) => ({
    message: phrase.message,
    rangeToHighlight: range,
  }));
}

export function calculateWarnings(target, patternsToFind) {
  const ranges = [];
  let nextNode;
  const textNodeIterator = document.createNodeIterator(
    target,
    NodeFilter.SHOW_TEXT
  );
  while ((nextNode = textNodeIterator.nextNode()) !== null) {
    ranges.push(
      ...patternsToFind.flatMap((pattern) => search(nextNode, pattern))
    );
  }
  return ranges;
}
