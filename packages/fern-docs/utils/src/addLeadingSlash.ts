export function addLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
