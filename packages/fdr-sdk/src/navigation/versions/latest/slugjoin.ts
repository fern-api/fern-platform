import urljoin from "url-join";

import { isNonNullish } from "@fern-api/ui-core-utils";

import { Slug } from ".";

// normalizes slug parts and joins them with a single slash
export function slugjoin(
  ...parts: (string | string[] | null | undefined)[]
): Slug {
  const slugArray = parts
    .filter(isNonNullish)
    .flatMap((part) =>
      typeof part === "string" ? [part.trim()] : part.map((part) => part.trim())
    );
  return Slug(
    urljoin(slugArray)
      .replaceAll("//*", "/")
      .replace(/^\//, "")
      .replace(/\/$/, "")
  );
}
