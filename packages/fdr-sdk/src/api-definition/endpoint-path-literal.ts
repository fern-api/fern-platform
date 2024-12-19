import { EndpointPathLiteral, EndpointPathPart } from "../client/APIV1Read";

/**
 * Commonly used in Express.js and how we render paths in the UI.
 */
export function toColonEndpointPathLiteral(
    pathParts: EndpointPathPart[]
): EndpointPathLiteral {
    return EndpointPathLiteral(
        pathParts
            .map((part) =>
                part.type === "literal" ? part.value : `:${part.value}`
            )
            .join("")
    );
}

/**
 * Used in OpenAPI specification and Fern Definition. This is how we store EndpointPathLiteral in the snippet resolver.
 */
export function toCurlyBraceEndpointPathLiteral(
    pathParts: EndpointPathPart[]
): EndpointPathLiteral {
    return EndpointPathLiteral(
        pathParts
            .map((part) =>
                part.type === "literal" ? part.value : `{${part.value}}`
            )
            .join("")
    );
}
