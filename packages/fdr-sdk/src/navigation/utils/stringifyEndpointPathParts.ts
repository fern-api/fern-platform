import urljoin from "url-join";

import type { APIV1Read } from "../../client/types";

export function stringifyEndpointPathParts(
  path: APIV1Read.EndpointPathPart[]
): string {
  return urljoin(
    "/",
    ...path.map((part) =>
      part.type === "literal" ? part.value : `:${part.value}`
    )
  );
}
