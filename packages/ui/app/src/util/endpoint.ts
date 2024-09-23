import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";

export type EndpointPathPart =
    | {
          type: "literal";
          value: string;
      }
    | {
          type: "pathParameter";
          name: string;
      };

export function getEndpointAvailabilityLabel(
    availability: APIV1Read.Availability | DocsV1Read.VersionAvailability,
): string {
    switch (availability) {
        case "Beta":
            return "Beta";
        case "Deprecated":
            return "Deprecated";
        case "GenerallyAvailable":
            return "GA";
        case "Stable":
            return "Stable";
        default:
            return "Unknown";
    }
}

export function getEndpointEnvironmentUrl(endpoint: ApiDefinition.EndpointDefinition): string | undefined {
    return resolveEnvironment(endpoint)?.baseUrl;
}

export function getEndpointTitleAsString(endpoint: APIV1Read.EndpointDefinition): string {
    return endpoint.name ?? getEndpointPathAsString(endpoint);
}

export function getEndpointPathAsString(endpoint: APIV1Read.EndpointDefinition): string {
    return (
        endpoint.method +
        " " +
        endpoint.path.parts
            .map((part) =>
                visitDiscriminatedUnion(part, "type")._visit({
                    literal: (literal) => literal.value,
                    pathParameter: (pathParameter) => getPathParameterAsString(pathParameter.value),
                    _other: () => "",
                }),
            )
            .join("")
    );
}

export function getPathParameterAsString(pathParameterKey: APIV1Read.PathParameterKey): string {
    return `:${pathParameterKey}`;
}
