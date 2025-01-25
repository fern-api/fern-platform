import { NextRequest } from "next/server";

export function withPathname(
  request: NextRequest,
  pathname: string,
  search?: string
): string {
  return `${request.nextUrl.origin}${pathname}${withQuestionMark(search) ?? request.nextUrl.search}`;
}

function withQuestionMark(search?: string): string | undefined {
  if (!search) {
    return undefined;
  }

  if (search.startsWith("?")) {
    return search;
  }

  return `?${search}`;
}
