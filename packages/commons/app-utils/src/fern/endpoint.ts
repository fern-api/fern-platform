import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
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

export function divideEndpointPathToParts(endpoint: FernRegistryApiRead.EndpointDefinition): EndpointPathPart[] {
    const parts: EndpointPathPart[] = [];
    endpoint.path.parts.forEach((part) => {
        if (part.type === "literal") {
            const subparts = part.value.split("/");
            subparts.forEach((subpart) => {
                if (subpart.length > 0) {
                    parts.push({ type: "literal", value: subpart });
                }
            });
        } else {
            if (part.value.length > 0) {
                parts.push({ type: "pathParameter", name: part.value });
            }
        }
    });
    return parts;
}

export function getEndpointEnvironmentUrl(endpoint: FernRegistryApiRead.EndpointDefinition): string | undefined {
    if (endpoint.defaultEnvironment != null) {
        const defaultEnvironment = endpoint.environments.find((env) => env.id === endpoint.defaultEnvironment);
        if (defaultEnvironment != null) {
            return defaultEnvironment.baseUrl;
        }
    }
    return endpoint.environments[0]?.baseUrl;
}

export function getEndpointTitleAsString(endpoint: FernRegistryApiRead.EndpointDefinition): string {
    return endpoint.name ?? getEndpointPathAsString(endpoint);
}

export function getEndpointPathAsString(endpoint: FernRegistryApiRead.EndpointDefinition): string {
    return (
        endpoint.method +
        " " +
        endpoint.path.parts
            .map((part) =>
                visitDiscriminatedUnion(part, "type")._visit({
                    literal: (literal) => literal.value,
                    pathParameter: (pathParameter) => getPathParameterAsString(pathParameter.value),
                    _other: () => "",
                })
            )
            .join("")
    );
}

export function getPathParameterAsString(pathParameterKey: FernRegistryApiRead.PathParameterKey): string {
    return `:${pathParameterKey}`;
}
