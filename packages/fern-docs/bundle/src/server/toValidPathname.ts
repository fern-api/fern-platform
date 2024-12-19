export function toValidPathname(
  pathname: string | string[] | undefined | null
): string {
  if (typeof pathname === "string") {
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
  }
  if (Array.isArray(pathname)) {
    return pathname.join("/");
  }
  return "";
}
