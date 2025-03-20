import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";

import { DocsLoader } from "@/server/docs-loader";

import { PlaygroundBearerAuthForm } from "./PlaygroundBearerAuthForm";
import { FoundOAuthReferencedEndpointForm } from "./PlaygroundOAuthForm";

async function OAuthReferencedEndpointForm({
  loader,
  apiDefinitionId,
  referencedEndpoint,
  disabled,
}: {
  loader: DocsLoader;
  apiDefinitionId: string;
  referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint;
  disabled?: boolean;
}) {
  try {
    const { endpoint, nodes, globalHeaders, authSchemes, types } =
      await loader.getEndpointById(
        apiDefinitionId,
        referencedEndpoint.endpointId
      );

    if (endpoint == null) {
      return (
        <PlaygroundBearerAuthForm
          bearerAuth={{ tokenName: "token" }}
          disabled={disabled}
        />
      );
    }

    return (
      <FoundOAuthReferencedEndpointForm
        context={{
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node: nodes[0]!,
          endpoint,
          globalHeaders,
          auth: authSchemes.filter((auth) => auth.type !== "oAuth")[0],
          types,
        }}
        referencedEndpoint={referencedEndpoint}
        disabled={disabled}
      />
    );
  } catch (e) {
    console.error(e);
    return (
      <PlaygroundBearerAuthForm
        bearerAuth={{ tokenName: "token" }}
        disabled={disabled}
      />
    );
  }
}

export async function PlaygroundOAuthFormServer({
  loader,
  apiDefinitionId,
  oAuth,
  disabled,
}: {
  loader: DocsLoader;
  apiDefinitionId: string;
  oAuth: APIV1Read.ApiAuth.OAuth;
  disabled?: boolean;
}): Promise<React.ReactNode> {
  return visitDiscriminatedUnion(oAuth.value, "type")._visit({
    clientCredentials: (clientCredentials) =>
      visitDiscriminatedUnion(clientCredentials.value, "type")._visit({
        referencedEndpoint: (referencedEndpoint) => (
          <OAuthReferencedEndpointForm
            loader={loader}
            apiDefinitionId={apiDefinitionId}
            referencedEndpoint={referencedEndpoint}
            disabled={disabled}
          />
        ),
        _other: () => null,
      }),
    _other: () => null,
  });
}
