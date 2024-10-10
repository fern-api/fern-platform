import { APIV1Read } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { useMemoOne } from "use-memo-one";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition, isEndpoint } from "../resolver/types";
import { DEPRECATED_FLATTENED_APIS_ATOM } from "./apis";

export function useOAuthEndpoint(referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint):
    | {
          oAuthEndpoint: ResolvedEndpointDefinition;
          types: Record<string, ResolvedTypeDefinition>;
      }
    | undefined {
    return useAtomValue(
        useMemoOne(
            () =>
                atom((get) => {
                    const flatApis = get(DEPRECATED_FLATTENED_APIS_ATOM);
                    for (const node of Object.values(flatApis)) {
                        const oAuthEndpoint = node.endpoints.find((e) => e.id === referencedEndpoint.endpointId);
                        if (oAuthEndpoint && isEndpoint(oAuthEndpoint)) {
                            const maybeTypes = flatApis[oAuthEndpoint.apiDefinitionId ?? ""]?.types;
                            if (maybeTypes != null) {
                                return {
                                    oAuthEndpoint,
                                    types: maybeTypes,
                                };
                            }
                        }
                    }
                    return;
                }),
            [referencedEndpoint],
        ),
    );
}
