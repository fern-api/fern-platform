import { APIV1Read } from "@fern-api/fdr-sdk/client/types";

export function stringifyEndpointPathParts(
    path: APIV1Read.EndpointPathPart[]
): string {
    return (
        "/" +
        path
            .map((part) =>
                part.type === "literal" ? part.value : `${part.value}`
            )
            .join("/")
    );
}
