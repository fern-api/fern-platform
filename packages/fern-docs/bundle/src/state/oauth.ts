import { APIV1Read } from "@fern-api/fdr-sdk";
import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

export function useOAuthEndpoint(
  _referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint
):
  | {
      oAuthEndpoint: ApiDefinition.EndpointDefinition;
      types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    }
  | undefined {
  return undefined;
  // return useAtomValue(
  //   useMemoOne(
  //     () =>
  //       atom((get) => {
  //         const apis = get(READ_APIS_ATOM);
  //         for (const apiDefinition of Object.values(apis)) {
  //           const oAuthEndpoint =
  //             apiDefinition.endpoints[referencedEndpoint.endpointId];
  //           if (oAuthEndpoint) {
  //             return {
  //               oAuthEndpoint,
  //               types: apiDefinition.types,
  //             };
  //           }
  //         }
  //         return;
  //       }),
  //     [referencedEndpoint]
  //   )
  // );
}
