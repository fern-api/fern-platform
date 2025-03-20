import { FC, ReactElement } from "react";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { DocsLoader } from "@/server/docs-loader";

import { PlaygroundBasicAuthForm } from "./PlaygroundBasicAuthForm";
import { PlaygroundBearerAuthForm } from "./PlaygroundBearerAuthForm";
import { PlaygroundHeaderAuthForm } from "./PlaygroundHeaderAuthForm";
import { PlaygroundOAuthFormServer } from "./PlaygroundOAuthFormServer";

interface PlaygroundAuthorizationFormProps {
  loader: DocsLoader;
  apiDefinitionId: string;
  auth: APIV1Read.ApiAuth;
  disabled: boolean;
}

export const PlaygroundAuthorizationForm: FC<
  PlaygroundAuthorizationFormProps
> = ({ loader, apiDefinitionId, auth, disabled }) => {
  return (
    <ul className="list-none px-4">
      {visitDiscriminatedUnion(auth, "type")._visit<ReactElement<any> | false>({
        bearerAuth: (bearerAuth) => (
          <PlaygroundBearerAuthForm
            bearerAuth={bearerAuth}
            disabled={disabled}
          />
        ),
        basicAuth: (basicAuth) => (
          <PlaygroundBasicAuthForm basicAuth={basicAuth} disabled={disabled} />
        ),
        header: (header) => (
          <PlaygroundHeaderAuthForm header={header} disabled={disabled} />
        ),
        oAuth: (oAuth) => (
          <PlaygroundOAuthFormServer
            loader={loader}
            apiDefinitionId={apiDefinitionId}
            oAuth={oAuth}
            disabled={disabled}
          />
        ),
        _other: () => false,
      })}
    </ul>
  );
};
