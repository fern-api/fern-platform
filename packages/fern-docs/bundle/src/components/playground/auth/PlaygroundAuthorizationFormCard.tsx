import { ReactElement } from "react";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernCollapse } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";
import { useSetAtom } from "jotai/react";

import {
  PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
} from "../../atoms";
import { useApiKeyInjectionConfig } from "../../services/useApiKeyInjectionConfig";
import { PlaygroundAuthorizationForm } from "./PlaygroundAuthorizationForm";
import { PlaygroundCardTriggerApiKeyInjected } from "./PlaygroundCardTriggerApiKeyInjected";
import { PlaygroundCardTriggerManual } from "./PlaygroundCardTriggerManual";

interface PlaygroundAuthorizationFormCardProps {
  auth: APIV1Read.ApiAuth;
  disabled: boolean;
}
export function PlaygroundAuthorizationFormCard({
  auth,
  disabled,
}: PlaygroundAuthorizationFormCardProps): ReactElement<any> | null {
  const setBearerAuth = useSetAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
  const setOAuth = useSetAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
  const isOpen = useBooleanState(false);
  const apiKeyInjection = useApiKeyInjectionConfig();
  const apiKey =
    apiKeyInjection.enabled && apiKeyInjection.authenticated
      ? apiKeyInjection.access_token
      : null;

  const handleResetBearerAuth = () => {
    setBearerAuth({ token: apiKey ?? "" });
    setOAuth((prev) => ({ ...prev, userSuppliedAccessToken: "" }));
  };

  return (
    <div>
      {apiKeyInjection.enabled ? (
        <PlaygroundCardTriggerApiKeyInjected
          auth={auth}
          config={apiKeyInjection}
          disabled={disabled}
          toggleOpen={isOpen.toggleValue}
          onClose={isOpen.setFalse}
        />
      ) : (
        <PlaygroundCardTriggerManual
          auth={auth}
          disabled={disabled}
          isOpen={isOpen.value}
          toggleOpen={isOpen.toggleValue}
        />
      )}

      <FernCollapse open={isOpen.value}>
        <div className="pt-4">
          <div className="fern-dropdown max-h-full">
            <PlaygroundAuthorizationForm
              auth={auth}
              closeContainer={isOpen.setFalse}
              disabled={disabled}
            />

            <div className="flex justify-end gap-2 p-4 pt-2">
              {auth.type !== "oAuth" && (
                <FernButton
                  text="Done"
                  intent="primary"
                  onClick={isOpen.setFalse}
                />
              )}
              {apiKey != null && (
                <FernButton
                  text="Reset token to default"
                  intent="none"
                  onClick={handleResetBearerAuth}
                  size="normal"
                  variant="outlined"
                />
              )}
            </div>
          </div>
        </div>
      </FernCollapse>
    </div>
  );
}
