export function isValidJsonPath(path: string): boolean {
  if (path.length === 0) {
    return false;
  }
  const jsonPathRegex =
    /^\$?(\.[\w*]+|\[['"][\w*]+['"]?\]|\[['"]?[\d*]+['"]?\]|\[[\d:]+\])*$/;
  return jsonPathRegex.test(path);
}
