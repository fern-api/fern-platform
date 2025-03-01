"use client";

import type { APIV1Read } from "@fern-api/fdr-sdk";

export function useOAuthEndpointContext(
  _referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint
): {
  context: undefined;
  isLoading: false;
} {
  // /**
  //  * The assumption here is that the referenced endpoint, which should represent an OAuth getToken endpoint, exists within the playground API groups.
  //  * The playground API groups is derived from the sidebar root node, which itself is a truncated version of the full navigation tree.
  //  * If the referenced endpoint is filtered away for some reason, i.e. using audiences, then the endpoint context will not be created.
  //  */
  // const endpointNodeAtom = useMemoOne(
  //   () =>
  //     atom((get) =>
  //       get(PLAYGROUND_API_GROUPS_ATOM)
  //         .flatMap((group) => group.items)
  //         .find(
  //           (item): item is EndpointNode =>
  //             item.type === "endpoint" &&
  //             item.endpointId === referencedEndpoint.endpointId
  //         )
  //     ),
  //   [referencedEndpoint.endpointId]
  // );
  // const endpointNode = useAtomValue(endpointNodeAtom);
  // return useEndpointContext(endpointNode);
  return {
    context: undefined,
    isLoading: false,
  };
}
