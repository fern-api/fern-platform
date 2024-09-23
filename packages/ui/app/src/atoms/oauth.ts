import { APIV1Read } from "@fern-api/fdr-sdk";
import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { atom, useAtomValue } from "jotai";
import { useMemoOne } from "use-memo-one";
import { APIS_ATOM } from "./apis";

export function useOAuthEndpoint(referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint):
    | {
          oAuthEndpoint: ApiDefinition.EndpointDefinition;
          types: Record<string, ApiDefinition.TypeDefinition>;
      }
    | undefined {
    return useAtomValue(
        useMemoOne(
            () =>
                atom((get) => {
                    for (const api of Object.values(get(APIS_ATOM))) {
                        const oAuthEndpoint = Object.values(api.endpoints).find(
                            (e) => e.id === referencedEndpoint.endpointId,
                        );
                        if (oAuthEndpoint) {
                            const maybeTypes = api.types;
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
