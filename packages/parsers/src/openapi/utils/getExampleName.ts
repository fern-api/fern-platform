export function getExampleName(
  requestName: string | undefined,
  responseName: string | undefined
): string | undefined {
  return requestName != null && requestName !== ""
    ? requestName
    : responseName != null && responseName !== ""
      ? responseName
      : undefined;
}
