function _truncate(
  getLength: (str: string) => number,
  string: string,
  byteLength: number
) {
  if (typeof string !== "string") {
    throw new Error("Input must be string");
  }

  let curByteLength = 0;
  let codePoint;
  let segment;

  for (let i = 0; i < string.length; i += 1) {
    codePoint = string.charCodeAt(i);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    segment = string[i]!;

    if (
      isHighSurrogate(codePoint) &&
      isLowSurrogate(string.charCodeAt(i + 1))
    ) {
      i += 1;
      segment += string[i];
    }

    curByteLength += getLength(segment);

    if (curByteLength === byteLength) {
      return string.slice(0, i + 1);
    } else if (curByteLength > byteLength) {
      return string.slice(0, i - segment.length + 1);
    }
  }

  return string;
}

function isHighSurrogate(codePoint: number) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint: number) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

/**
 * Truncates a string to the specified byte length.
 *
 * @see https://github.com/parshap/truncate-utf8-bytes
 */
export const truncateToBytes = _truncate.bind(
  null,
  Buffer.byteLength.bind(Buffer)
);
