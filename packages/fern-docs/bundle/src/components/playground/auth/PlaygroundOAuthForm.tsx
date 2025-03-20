"use client";

import { ReactElement, useState } from "react";

import { useAtom } from "jotai";
import { HelpCircle, Key, User } from "lucide-react";

import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import {
  FernButton,
  FernDropdown,
  FernSegmentedControl,
  FernTooltip,
  FernTooltipProvider,
} from "@fern-docs/components";

import { Callout } from "@/mdx/components/callout";
import {
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
  usePlaygroundEndpointFormState,
} from "@/state/playground";

import { PasswordInputGroup } from "../PasswordInputGroup";
import { PlaygroundEndpointForm } from "../endpoint";
import { oAuthClientCredentialReferencedEndpointLoginFlow } from "../utils/oauth";
import { usePlaygroundBaseUrl } from "../utils/select-environment";
import { useClosePlaygroundAuthorizationFormCard } from "./PlaygroundAuthorizationFormCardRoot";

export function FoundOAuthReferencedEndpointForm({
  context,
  referencedEndpoint,
  disabled,
}: {
  /**
   * this must be the OAuth endpoint.
   */
  context: EndpointContext;
  referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint;
  disabled?: boolean;
}): ReactElement<any> {
  const closeContainer = useClosePlaygroundAuthorizationFormCard();
  const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
  const [formState, setFormState] = usePlaygroundEndpointFormState(context);
  const [baseUrl] = usePlaygroundBaseUrl(context.endpoint);

  const [displayFailedLogin, setDisplayFailedLogin] = useState(false);

  /**
   * TODO: turn this into a loadable (suspense)
   */
  const oAuthClientCredentialLogin = async () => {
    setValue((prev) => ({ ...prev, isLoggingIn: true }));
    await oAuthClientCredentialReferencedEndpointLoginFlow({
      formState,
      endpoint: context.endpoint,
      referencedEndpoint,
      baseUrl,
      setValue,
      closeContainer,
      setDisplayFailedLogin,
    });
    setValue((prev) => ({ ...prev, isLoggingIn: false }));
  };

  const authenticationOptions: FernDropdown.Option[] = [
    {
      type: "value",
      value: "credentials",
      label: "Credentials",
      icon: <User />,
    },
    { type: "value", value: "token", label: "Bearer Token", icon: <Key /> },
  ];

  return value.isLoggingIn ? (
    <li className="-mx-4 flex flex-1 items-center justify-center space-y-2 p-4 pt-8">
      Loading...
    </li>
  ) : (
    <>
      <li className="-mx-4 space-y-2 p-4 pb-2">
        <FernSegmentedControl
          options={authenticationOptions}
          onValueChange={(value: string) => {
            if (value != null && value.length > 0) {
              setValue((prev) => ({
                ...prev,
                selectedInputMethod: value as "credentials" | "token",
              }));
            }
          }}
          value={value.selectedInputMethod}
          disabled={disabled}
        />
      </li>

      {value.selectedInputMethod === "credentials" ? (
        <>
          <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
              <span className="font-mono text-sm">
                OAuth Client Credentials Login
              </span>
            </label>
            <PlaygroundEndpointForm
              context={context}
              formState={formState}
              setFormState={setFormState}
              ignoreHeaders={true}
            />
          </li>
          {displayFailedLogin && (
            <Callout intent="error">
              Failed to login with the provided credentials
            </Callout>
          )}
          {value.isLoggedIn && (
            <li className="-mx-4 space-y-2 p-4 pt-0">
              <FernTooltipProvider>
                <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2">
                  <label className="inline-flex items-baseline gap-2 truncate">
                    <span className="inline-flex font-mono text-sm">
                      Generated OAuth Token
                      <FernTooltip content="This bearer token was generated from an OAuth API call, and as a result cannot be edited">
                        <HelpCircle className="text-(color:--grayscale-a11) ml-2 size-4 self-center" />
                      </FernTooltip>
                    </span>
                  </label>
                </div>
              </FernTooltipProvider>
              <PasswordInputGroup
                value={value.accessToken}
                disabled={true}
                className="text-(color:--grayscale-a11)"
              />
            </li>
          )}
          {value.isLoggedIn &&
            value.accessToken !== value.loggedInStartingToken && (
              <Callout intent="warning">
                The bearer token is no longer valid. Please refresh it by
                clicking the button below
              </Callout>
            )}
        </>
      ) : (
        <>
          <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
              <span className="font-mono text-sm">
                User Supplied Bearer Token
              </span>
            </label>

            <PasswordInputGroup
              onValueChange={(newValue: string) =>
                setValue((prev) => ({
                  ...prev,
                  userSuppliedAccessToken: newValue,
                }))
              }
              value={value.userSuppliedAccessToken}
              autoComplete="off"
              data-1p-ignore="true"
              disabled={disabled}
            />
          </li>
        </>
      )}
      <li className="flex justify-end pt-4">
        {value.selectedInputMethod === "credentials" && (
          <FernButton
            text={`${value.isLoggedIn ? "Refresh" : "Fetch"} Bearer Token`}
            intent="primary"
            onClick={oAuthClientCredentialLogin}
            disabled={disabled}
          />
        )}
      </li>
    </>
  );
}
