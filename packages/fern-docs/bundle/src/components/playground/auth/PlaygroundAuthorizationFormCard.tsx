import "server-only";

import { ReactElement } from "react";
import React from "react";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";

import { DocsLoader } from "@/server/docs-loader";

import { PlaygroundAuthorizationForm } from "./PlaygroundAuthorizationForm";
import {
  PlaygroundAuthorizationCardTrigger,
  PlaygroundAuthorizationFormCardCloseButton,
  PlaygroundAuthorizationFormCardContent,
  PlaygroundAuthorizationFormCardResetButton,
  PlaygroundAuthorizationFormCardRoot,
} from "./PlaygroundAuthorizationFormCardRoot";

interface PlaygroundAuthorizationFormCardProps {
  loader: DocsLoader;
  apiDefinitionId: string;
  auth: APIV1Read.ApiAuth;
  disabled?: boolean;
}
export function PlaygroundAuthorizationFormCard({
  loader,
  apiDefinitionId,
  auth,
  disabled = false,
}: PlaygroundAuthorizationFormCardProps): ReactElement<any> | null {
  return (
    <PlaygroundAuthorizationFormCardRoot>
      <PlaygroundAuthorizationCardTrigger auth={auth} disabled={disabled} />
      <PlaygroundAuthorizationFormCardContent>
        <div className="fern-dropdown max-h-full">
          <PlaygroundAuthorizationForm
            loader={loader}
            apiDefinitionId={apiDefinitionId}
            auth={auth}
            disabled={disabled}
          />
          <div className="flex justify-end gap-2 p-4 pt-2">
            {auth.type !== "oAuth" && (
              <PlaygroundAuthorizationFormCardCloseButton />
            )}
            <PlaygroundAuthorizationFormCardResetButton />
          </div>
        </div>
      </PlaygroundAuthorizationFormCardContent>
    </PlaygroundAuthorizationFormCardRoot>
  );
}
