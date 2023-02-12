import * as Util from './util';

export function findRanges(node, patternsToFind) {
  return patternsToFind.flatMap((pattern) =>
    Util.match(node, pattern.regex).map((range) => ({
      message: pattern.message,
      rangeToHighlight: range,
    }))
  );
}
