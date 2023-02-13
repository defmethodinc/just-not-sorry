import * as Util from './util';

const textNodeIterator = (node) =>
  document.createNodeIterator(node, NodeFilter.SHOW_TEXT);

export function findRanges(node, patternsToFind) {
  const result = [];
  const iter = textNodeIterator(node);
  let nextNode;
  while ((nextNode = iter.nextNode()) !== null) {
    result.push(
      ...patternsToFind.flatMap((pattern) =>
        Util.match(nextNode, pattern.regex).map((range) => ({
          message: pattern.message,
          rangeToHighlight: range,
        }))
      )
    );
  }
  return result;
}
