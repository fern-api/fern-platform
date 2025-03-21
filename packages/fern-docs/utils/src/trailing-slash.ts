function isTruthy(value: string | undefined) {
  return value != null && ["true", "1"].includes(value.trim().toLowerCase());
}

export const isTrailingSlashEnabled = (): boolean => {
  return isTruthy(process.env.NEXT_PUBLIC_TRAILING_SLASH);
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
  // root pathname should always be `/` regardless of trailing slash setting
  // because empty string is not a valid URL pathname
  if (pathname === "/" || pathname === "") {
    return "/";
  }

  // Check if the pathname is a URL
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    try {
      // conform pathname of fully qualified URLs
      const url = new URL(pathname);
      url.pathname = conformTrailingSlash(url.pathname);
      return String(url);
    } catch {
      // continue
    }
  }

  // Find the position of the first ? or # character
  const queryOrHashIndex = Math.min(
    pathname.includes("?") ? pathname.indexOf("?") : Infinity,
    pathname.includes("#") ? pathname.indexOf("#") : Infinity
  );

  // conform trailing slash of pathname before query or hash
  if (queryOrHashIndex !== Infinity) {
    // Split the pathname into base and query/hash parts
    const base = pathname.substring(0, queryOrHashIndex);
    const rest = pathname.substring(queryOrHashIndex);

    // Add trailing slash to the base part
    return conformTrailingSlash(base) + rest;
  }

  return isTrailingSlashEnabled()
    ? addTrailingSlash(pathname)
    : removeTrailingSlash(pathname);
}
