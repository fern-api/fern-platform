import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { ResolvedEndpointDefinition, resolveEnvironment } from "../resolver/types";

export type EndpointPathPart =
    | {
          type: "literal";
          value: string;
      }
    | {
          type: "pathParameter";
          name: string;
      };

export function getEndpointEnvironmentUrl(
    endpoint: ResolvedEndpointDefinition,
    playgroundEnvironment?: string | undefined,
): string | undefined {
    return playgroundEnvironment ?? resolveEnvironment(endpoint)?.baseUrl;
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

export function getPathParameterAsString(pathParameterKey: APIV1Read.PropertyKey): string {
    return `:${pathParameterKey}`;
}
