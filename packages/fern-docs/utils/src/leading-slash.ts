export function addLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function removeLeadingSlash(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}
