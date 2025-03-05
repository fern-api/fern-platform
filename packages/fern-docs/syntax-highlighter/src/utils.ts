// [number, number] is a range of lines to highlight
export type LineNumber = number | [number, number];

export function getLineHeight(fontSize: "sm" | "base" | "lg"): number {
  return 1.625 * (fontSize === "sm" ? 12 : fontSize === "base" ? 14 : 16);
}

export function getMaxHeight(
  fontSize: "sm" | "base" | "lg",
  maxLines?: number
): number | undefined {
  if (maxLines == null || maxLines <= 0) {
    return undefined;
  }

  const lineHeight = getLineHeight(fontSize);

  return maxLines * lineHeight + (fontSize === "sm" ? 8 : 12) * 2;
}

export function flattenLineNumbers(lineNumbers: LineNumber[]): number[] {
  return lineNumbers.flatMap((lineNumber) => {
    if (Array.isArray(lineNumber)) {
      const [start, end] = lineNumber;
      return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
    }
    return [lineNumber - 1];
  });
}
