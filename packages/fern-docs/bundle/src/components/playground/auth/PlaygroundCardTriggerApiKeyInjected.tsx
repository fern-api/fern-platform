import { useSearchParams } from "next/navigation";
import { ReactElement, useEffect } from "react";

import { useAtomValue, useSetAtom } from "jotai";
import { Key, User } from "lucide-react";
import urlJoin from "url-join";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { APIKeyInjectionConfigEnabled } from "@fern-docs/auth";
import { FernButton, FernCard } from "@fern-docs/components";

import { Callout } from "@/mdx/components/callout";
import {
  PLAYGROUND_AUTH_STATE_ATOM,
  PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
} from "@/state/playground";

import { useApiRoute } from "../../hooks/useApiRoute";
import { PlaygroundAuthorizationForm } from "./PlaygroundAuthorizationForm";

interface PlaygroundCardTriggerApiKeyInjectedProps {
  auth: APIV1Read.ApiAuth;
  config: APIKeyInjectionConfigEnabled;
  disabled: boolean;
  toggleOpen: () => void;
  onClose: () => void;
}

export function PlaygroundCardTriggerApiKeyInjected({
  auth,
  config,
  disabled,
  toggleOpen,
  onClose,
}: PlaygroundCardTriggerApiKeyInjectedProps): ReactElement<any> | false {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);
  const logoutApiRoute = useApiRoute("/api/fern-docs/auth/logout");

  const apiKey = config.authenticated ? config.access_token : null;
  const setBearerAuth = useSetAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);

  // TODO change this to on-login
  useEffect(() => {
    if (apiKey != null) {
      setBearerAuth({ token: apiKey });
    }
  }, [apiKey, setBearerAuth]);

  const handleResetBearerAuth = () => {
    setBearerAuth({ token: apiKey ?? "" });
  };

  const redirectOrOpenAuthForm = () => {
    if (!config.authenticated) {
      const url = new URL(config.authorizationUrl);
      const state = new URL(window.location.href);
      if (state.searchParams.has("error")) {
        state.searchParams.delete("error");
      }
      if (state.searchParams.has("error_description")) {
        state.searchParams.delete("error_description");
      }
      url.searchParams.set(config.returnToQueryParam, state.toString());
      window.location.replace(url);
    } else {
      toggleOpen();
    }
  };

  if (apiKey != null && apiKey.trim().length > 0) {
    return (
      <FernCard
        className="rounded-3 mb-3 p-4"
        title="Login to send a real request"
      >
        <FernButton
          className="pointer-events-none w-full text-left"
          size="large"
          intent="success"
          variant="outlined"
          text="Successfully logged in"
          icon={<Key />}
          active={true}
        />
        <div className="-mx-4">
          <PlaygroundAuthorizationForm
            auth={auth}
            closeContainer={onClose}
            disabled={disabled}
          />
        </div>
        {
          <div className="flex justify-end gap-2">
            {apiKey !== authState?.bearerAuth?.token && apiKey && (
              <FernButton
                text="Reset token to default"
                intent="none"
                icon={<Key />}
                onClick={handleResetBearerAuth}
                size="normal"
                variant="outlined"
              />
            )}
            <FernButton
              text="Logout"
              intent="none"
              onClick={() => {
                if (!config.authenticated) {
                  return;
                }
                const url = new URL(
                  urlJoin(window.location.origin, logoutApiRoute)
                );
                const returnTo = new URL(window.location.href);
                url.searchParams.set(
                  config.returnToQueryParam,
                  returnTo.toString()
                );
                fetch(url)
                  .then(() => {
                    window.location.reload();
                  })
                  .catch((error: unknown) => {
                    console.error(error);
                  });
              }}
              size="normal"
              variant="outlined"
            />
          </div>
        }
      </FernCard>
    );
  }

  return (
    <FernCard className="rounded-3 mb-2 p-4">
      {error && <Callout intent="error">{errorDescription ?? error}</Callout>}

      <h5 className="text-(color:--grayscale-a11) m-0">
        Login to send a real request
      </h5>
      <div className="my-5 flex justify-center gap-2">
        <FernButton
          size="normal"
          intent="primary"
          text="Login"
          icon={<User />}
          onClick={redirectOrOpenAuthForm}
        />
        <FernButton
          size="normal"
          intent="none"
          variant="outlined"
          icon={<Key />}
          text="Provide token manually"
          onClick={toggleOpen}
        />
      </div>
    </FernCard>
  );
}
