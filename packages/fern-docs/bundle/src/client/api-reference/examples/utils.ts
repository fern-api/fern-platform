export function lineNumberOf(a: string, match: string): number {
  const startChar = a.indexOf(match);
  if (startChar === -1) {
    return -1;
  }

  return a.slice(0, startChar).split("\n").length - 1;
}
