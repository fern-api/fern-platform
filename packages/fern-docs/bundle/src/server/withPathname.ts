import { NextRequest } from "next/server";

export function withPathname(
  request: NextRequest,
  pathname: string,
  search?: string | URLSearchParams | Record<string, string> | string[][]
): string {
  const url = new URL(request.url);
  url.pathname = pathname;

  // merge search params
  if (search) {
    const params = new URLSearchParams(search);
    // TODO: this doesn't handle exploded search params
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return String(url);
}
