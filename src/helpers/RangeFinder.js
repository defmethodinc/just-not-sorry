import * as Util from './util';

export function calculateWarnings(target, patternsToFind) {
  const ranges = [];
  let nextNode;
  const textNodeIterator = document.createNodeIterator(
    target,
    NodeFilter.SHOW_TEXT
  );
  while ((nextNode = textNodeIterator.nextNode()) !== null) {
    ranges.push(
      ...patternsToFind.flatMap((pattern) => {
        return Util.match(nextNode, pattern.regex).map((range) => ({
          message: pattern.message,
          rangeToHighlight: range,
        }));
      })
    );
  }
  return ranges;
}
