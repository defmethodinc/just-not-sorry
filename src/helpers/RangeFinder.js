import * as Util from './util';

const textNodeIterator = (node) =>
  document.createNodeIterator(node, NodeFilter.SHOW_TEXT);

export function findRanges(node, patternsToFind) {
  const result = [];
  const iter = textNodeIterator(node);
  let textNode;
  while ((textNode = iter.nextNode()) !== null) {
    for (let p = 0; p < patternsToFind.length; p++) {
      const pattern = patternsToFind[p];
      const ranges = Util.match(textNode, pattern.regex);
      if (ranges.length > 0) {
        for (let r = 0; r < ranges.length; r++) {
          result.push({
            message: pattern.message,
            rangeToHighlight: ranges[r],
          });
        }
      }
    }
  }
  return result;
}
