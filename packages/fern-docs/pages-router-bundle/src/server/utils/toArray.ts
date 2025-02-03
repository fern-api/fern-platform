/**
 * Converts a query parameter or header to an array.
 */
export function toArray(param: string | string[] | null | undefined): string[] {
  if (Array.isArray(param)) {
    return param;
  }
  return param != null ? [param] : [];
}
