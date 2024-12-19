import { APIV1Read } from "@fern-api/fdr-sdk";
import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { atom, useAtomValue } from "jotai";
import { useMemoOne } from "use-memo-one";
import { READ_APIS_ATOM } from "./apis";

export function useOAuthEndpoint(
    referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint
):
    | {
          oAuthEndpoint: ApiDefinition.EndpointDefinition;
          types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
      }
    | undefined {
    return useAtomValue(
        useMemoOne(
            () =>
                atom((get) => {
                    const apis = get(READ_APIS_ATOM);
                    for (const apiDefinition of Object.values(apis)) {
                        const oAuthEndpoint =
                            apiDefinition.endpoints[
                                referencedEndpoint.endpointId
                            ];
                        if (oAuthEndpoint) {
                            return {
                                oAuthEndpoint,
                                types: apiDefinition.types,
                            };
                        }
                    }
                    return;
                }),
            [referencedEndpoint]
        )
    );
}
