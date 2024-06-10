import urljoin from "url-join";
import { APIV1Read } from "../../client";

export function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return urljoin("/", ...path.map((part) => (part.type === "literal" ? part.value : `:${part.value}`)));
}
