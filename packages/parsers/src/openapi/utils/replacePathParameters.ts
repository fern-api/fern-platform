export function replacePathParameters(
  path: string,
  pathParameterExamples: Record<string, unknown>
) {
  return path.replace(/{(\w+)}/g, (match, key) => {
    return (pathParameterExamples[key] != null &&
      typeof pathParameterExamples[key] === "string") ||
      typeof pathParameterExamples[key] === "number" ||
      typeof pathParameterExamples[key] === "boolean"
      ? `${pathParameterExamples[key]}`
      : match;
  });
}
