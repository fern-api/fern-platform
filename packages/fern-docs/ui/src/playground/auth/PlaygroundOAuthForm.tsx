import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import {
  FernButton,
  FernDropdown,
  FernSegmentedControl,
  FernTooltip,
  FernTooltipProvider,
} from "@fern-docs/components";
import { HelpCircle, Key, User } from "iconoir-react";
import { useAtom } from "jotai";
import { ReactElement, useState } from "react";
import {
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
  usePlaygroundEndpointFormState,
} from "../../atoms";
import { useStandardProxyEnvironment } from "../../hooks/useStandardProxyEnvironment";
import { Callout } from "../../mdx/components/callout";
import { PasswordInputGroup } from "../PasswordInputGroup";
import { PlaygroundEndpointForm } from "../endpoint";
import { useOAuthEndpointContext } from "../hooks";
import { oAuthClientCredentialReferencedEndpointLoginFlow } from "../utils/oauth";
import { usePlaygroundBaseUrl } from "../utils/select-environment";
import { PlaygroundBearerAuthForm } from "./PlaygroundBearerAuthForm";

function FoundOAuthReferencedEndpointForm({
  context,
  referencedEndpoint,
  closeContainer,
  disabled,
}: {
  /**
   * this must be the OAuth endpoint.
   */
  context: EndpointContext;
  referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint;
  closeContainer: () => void;
  disabled?: boolean;
}): ReactElement {
  const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
  const proxyEnvironment = useStandardProxyEnvironment();
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
      proxyEnvironment,
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
    <li className="-mx-4 space-y-2 p-4 pt-8 flex flex-1 items-center justify-center">
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
                    <span className="font-mono text-sm inline-flex">
                      Generated OAuth Token
                      <FernTooltip content="This bearer token was generated from an OAuth API call, and as a result cannot be edited">
                        <HelpCircle className="t-muted size-4 self-center ml-2" />
                      </FernTooltip>
                    </span>
                  </label>
                </div>
              </FernTooltipProvider>
              <PasswordInputGroup
                value={value.accessToken}
                disabled={true}
                className="t-muted"
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

function OAuthReferencedEndpointForm({
  referencedEndpoint,
  closeContainer,
  disabled,
}: {
  referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint;
  closeContainer: () => void;
  disabled?: boolean;
}) {
  const { context, isLoading } = useOAuthEndpointContext(referencedEndpoint);

  if (context == null) {
    if (!isLoading) {
      // eslint-disable-next-line no-console
      console.error(
        "Could not find OAuth endpoint for referenced endpoint",
        referencedEndpoint
      );
    }
    return (
      <PlaygroundBearerAuthForm
        bearerAuth={{ tokenName: "token" }}
        disabled={disabled}
      />
    );
  }

  return (
    <FoundOAuthReferencedEndpointForm
      context={context}
      referencedEndpoint={referencedEndpoint}
      closeContainer={closeContainer}
      disabled={disabled}
    />
  );
}

export function PlaygroundOAuthForm({
  oAuth,
  closeContainer,
  disabled,
}: {
  oAuth: APIV1Read.ApiAuth.OAuth;
  closeContainer: () => void;
  disabled?: boolean;
}): ReactElement | false {
  return visitDiscriminatedUnion(oAuth.value, "type")._visit({
    clientCredentials: (clientCredentials) => {
      return visitDiscriminatedUnion(clientCredentials.value, "type")._visit<
        ReactElement | false
      >({
        referencedEndpoint: (referencedEndpoint) => (
          <OAuthReferencedEndpointForm
            referencedEndpoint={referencedEndpoint}
            closeContainer={closeContainer}
            disabled={disabled}
          />
        ),
        _other: () => false,
      });
    },
    _other: () => false,
  });
}
