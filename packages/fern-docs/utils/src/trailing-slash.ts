function isTruthy(value: string | undefined) {
  return value != null && ["true", "1"].includes(value.trim().toLowerCase());
}

export const isTrailingSlashEnabled = (): boolean => {
  return isTruthy(process.env.TRAILING_SLASH);
};

export const addTrailingSlash = (pathname: string): string => {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

export const removeTrailingSlash = (pathname: string): string => {
  return pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
};

export function conformTrailingSlash(pathname: string): string {
  return isTrailingSlashEnabled()
    ? addTrailingSlash(pathname)
    : removeTrailingSlash(pathname);
}
