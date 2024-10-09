import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import {
    FernButton,
    FernCard,
    FernCollapse,
    FernDropdown,
    FernInput,
    FernSegmentedControl,
    FernTooltip,
    FernTooltipProvider,
} from "@fern-ui/components";
import { useBooleanState } from "@fern-ui/react-commons";
import { HelpCircle, Key, User } from "iconoir-react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { isEmpty } from "lodash-es";
import { useRouter } from "next/router";
import { FC, ReactElement, SetStateAction, useCallback, useEffect, useState } from "react";
import urlJoin from "url-join";
import { useMemoOne } from "use-memo-one";
import {
    PLAYGROUND_AUTH_STATE_ATOM,
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM,
    PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
    PLAYGROUND_AUTH_STATE_HEADER_ATOM,
    PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
    usePlaygroundEndpointFormState,
} from "../atoms";
import { useApiRoute } from "../hooks/useApiRoute";
import { useStandardProxyEnvironment } from "../hooks/useStandardProxyEnvironment";
import { Callout } from "../mdx/components/callout";
import { useApiKeyInjectionConfig } from "../services/useApiKeyInjectionConfig";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundEndpointForm } from "./endpoint/PlaygroundEndpointForm";
import { useOAuthEndpointContext } from "./hooks/useOauthEndpointContext";
import { PlaygroundAuthState } from "./types";
import { oAuthClientCredentialReferencedEndpointLoginFlow } from "./utils/oauth";
import { usePlaygroundBaseUrl } from "./utils/select-environment";

interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    closeContainer: () => void;
    disabled: boolean;
}

function BearerAuthForm({ bearerAuth, disabled }: { bearerAuth: APIV1Read.BearerAuth; disabled?: boolean }) {
    const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
    const handleChange = useCallback((newValue: string) => setValue({ token: newValue }), [setValue]);

    return (
        <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
                <span className="font-mono text-sm">{bearerAuth.tokenName ?? "Bearer token"}</span>
            </label>

            <div>
                <PasswordInputGroup
                    onValueChange={handleChange}
                    value={value.token}
                    autoComplete="off"
                    data-1p-ignore="true"
                    disabled={disabled}
                />
            </div>
        </li>
    );
}

function BasicAuthForm({ basicAuth, disabled }: { basicAuth: APIV1Read.BasicAuth; disabled?: boolean }) {
    const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM);
    const handleChangeUsername = useCallback(
        (newValue: string) => setValue((prev) => ({ ...prev, username: newValue })),
        [setValue],
    );
    const handleChangePassword = useCallback(
        (newValue: string) => setValue((prev) => ({ ...prev, password: newValue })),
        [setValue],
    );
    return (
        <>
            <li className="-mx-4 space-y-2 p-4">
                <label className="inline-flex flex-wrap items-baseline">
                    <span className="font-mono text-sm">{basicAuth.usernameName ?? "Username"}</span>
                </label>
                <div>
                    <FernInput
                        onValueChange={handleChangeUsername}
                        value={value.username}
                        leftIcon={<User className="size-icon" />}
                        rightElement={<span className="t-muted text-xs">{"string"}</span>}
                        disabled={disabled}
                    />
                </div>
            </li>

            <li className="-mx-4 space-y-2 p-4">
                <label className="inline-flex flex-wrap items-baseline">
                    <span className="font-mono text-sm">{basicAuth.passwordName ?? "Password"}</span>
                </label>

                <div>
                    <PasswordInputGroup
                        onValueChange={handleChangePassword}
                        value={value.password}
                        disabled={disabled}
                    />
                </div>
            </li>
        </>
    );
}

function HeaderAuthForm({ header, disabled }: { header: APIV1Read.HeaderAuth; disabled?: boolean }) {
    const [value, setValue] = useAtom(
        useMemoOne(
            () =>
                atom(
                    (get) => get(PLAYGROUND_AUTH_STATE_HEADER_ATOM).headers[header.headerWireValue],
                    (_get, set, change: SetStateAction<string>) => {
                        set(PLAYGROUND_AUTH_STATE_HEADER_ATOM, ({ headers }) => ({
                            headers: {
                                ...headers,
                                [header.headerWireValue]:
                                    typeof change === "function"
                                        ? change(headers[header.headerWireValue] ?? "")
                                        : change,
                            },
                        }));
                    },
                ),
            [header.headerWireValue],
        ),
    );

    return (
        <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
                <span className="font-mono text-sm">{header.nameOverride ?? header.headerWireValue}</span>
            </label>
            <div>
                <PasswordInputGroup
                    onValueChange={setValue}
                    value={value}
                    autoComplete="off"
                    data-1p-ignore="true"
                    disabled={disabled}
                />
            </div>
        </li>
    );
}

function FoundOAuthReferencedEndpointForm({
    context,
    oAuthClientCredentialsReferencedEndpoint,
    closeContainer,
    disabled,
}: {
    /**
     * this must be the OAuth endpoint.
     */
    context: EndpointContext;
    oAuthClientCredentialsReferencedEndpoint: APIV1Read.OAuthClientCredentialsReferencedEndpoint;
    closeContainer: () => void;
    disabled?: boolean;
}) {
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
            oAuthClientCredentialsReferencedEndpoint,
            baseUrl,
            setValue,
            closeContainer,
            setDisplayFailedLogin,
        });
        setValue((prev) => ({ ...prev, isLoggingIn: false }));
    };

    const authenticationOptions: FernDropdown.Option[] = [
        { type: "value", value: "credentials", label: "Credentials", icon: <User /> },
        { type: "value", value: "token", label: "Bearer Token", icon: <Key /> },
    ];

    return value.isLoggingIn ? (
        <li className="-mx-4 space-y-2 p-4 pt-8 flex flex-1 items-center justify-center">Loading...</li>
    ) : (
        <>
            <li className="-mx-4 space-y-2 p-4 pb-2">
                <FernSegmentedControl
                    options={authenticationOptions}
                    onValueChange={(value: string) => {
                        if (value != null && value.length > 0) {
                            setValue((prev) => ({ ...prev, selectedInputMethod: value as "credentials" | "token" }));
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
                            <span className="font-mono text-sm">OAuth Client Credentials Login</span>
                        </label>
                        <PlaygroundEndpointForm
                            context={context}
                            formState={formState}
                            setFormState={setFormState}
                            ignoreHeaders={true}
                        />
                    </li>
                    {displayFailedLogin && (
                        <Callout intent="error">Failed to login with the provided credentials</Callout>
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
                            <PasswordInputGroup value={value.accessToken} disabled={true} className="t-muted" />
                        </li>
                    )}
                    {value.isLoggedIn && value.accessToken !== value.loggedInStartingToken && (
                        <Callout intent="warning">
                            The bearer token is no longer valid. Please refresh it by clicking the button below
                        </Callout>
                    )}
                </>
            ) : (
                <>
                    <li className="-mx-4 space-y-2 p-4">
                        <label className="inline-flex flex-wrap items-baseline">
                            <span className="font-mono text-sm">User Supplied Bearer Token</span>
                        </label>

                        <PasswordInputGroup
                            onValueChange={(newValue: string) =>
                                setValue((prev) => ({ ...prev, userSuppliedAccessToken: newValue }))
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
    oAuthClientCredentialsReferencedEndpoint,
    closeContainer,
    disabled,
}: {
    referencedEndpoint: APIV1Read.OAuthClientCredentials.ReferencedEndpoint;
    oAuthClientCredentialsReferencedEndpoint: APIV1Read.OAuthClientCredentialsReferencedEndpoint;
    closeContainer: () => void;
    disabled?: boolean;
}) {
    const { context, isLoading } = useOAuthEndpointContext(referencedEndpoint);

    if (context == null) {
        if (!isLoading) {
            // eslint-disable-next-line no-console
            console.error("Could not find OAuth endpoint for referenced endpoint", referencedEndpoint);
        }
        return <BearerAuthForm bearerAuth={{ tokenName: "token" }} disabled={disabled} />;
    }

    return (
        <FoundOAuthReferencedEndpointForm
            context={context}
            oAuthClientCredentialsReferencedEndpoint={oAuthClientCredentialsReferencedEndpoint}
            closeContainer={closeContainer}
            disabled={disabled}
        />
    );
}

function OAuthForm({
    oAuth,
    closeContainer,
    disabled,
}: {
    oAuth: APIV1Read.ApiAuth.OAuth;
    closeContainer: () => void;
    disabled?: boolean;
}) {
    return visitDiscriminatedUnion(oAuth.value, "type")._visit({
        clientCredentials: (clientCredentials) => {
            return visitDiscriminatedUnion(clientCredentials.value, "type")._visit({
                referencedEndpoint: (referencedEndpoint) => {
                    return (
                        <OAuthReferencedEndpointForm
                            referencedEndpoint={referencedEndpoint}
                            oAuthClientCredentialsReferencedEndpoint={referencedEndpoint}
                            closeContainer={closeContainer}
                            disabled={disabled}
                        />
                    );
                },
                _other: () => null,
            });
        },
        _other: () => null,
    });
}

export const PlaygroundAuthorizationForm: FC<PlaygroundAuthorizationFormProps> = ({
    auth,
    closeContainer,
    disabled,
}) => {
    return (
        <ul className="list-none px-4">
            {visitDiscriminatedUnion(auth, "type")._visit({
                bearerAuth: (bearerAuth) => <BearerAuthForm bearerAuth={bearerAuth} disabled={disabled} />,
                basicAuth: (basicAuth) => <BasicAuthForm basicAuth={basicAuth} disabled={disabled} />,
                header: (header) => <HeaderAuthForm header={header} disabled={disabled} />,
                oAuth: (oAuth) => <OAuthForm oAuth={oAuth} closeContainer={closeContainer} disabled={disabled} />,
                _other: () => null,
            })}
        </ul>
    );
};

interface PlaygroundAuthorizationFormCardProps {
    auth: APIV1Read.ApiAuth;
    disabled: boolean;
}

export function PlaygroundAuthorizationFormCard({
    auth,
    disabled,
}: PlaygroundAuthorizationFormCardProps): ReactElement | null {
    const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);
    const setBearerAuth = useSetAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
    const oAuth = useAtomValue(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
    const isOpen = useBooleanState(false);
    const apiKeyInjection = useApiKeyInjectionConfig();
    const router = useRouter();
    const apiKey = apiKeyInjection.enabled && apiKeyInjection.authenticated ? apiKeyInjection.access_token : null;
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleResetBearerAuth = useCallback(() => {
        setBearerAuth({ token: apiKey ?? "" });
    }, [apiKey, setBearerAuth]);

    const logoutApiRoute = useApiRoute("/api/fern-docs/auth/logout");
    const callbackApiRoute = useApiRoute("/api/fern-docs/auth/callback");

    const redirectOrOpenAuthForm = () => {
        if (apiKeyInjection.enabled && !apiKeyInjection.authenticated) {
            const url = new URL(apiKeyInjection.url);
            const state = new URL(window.location.href);
            if (state.searchParams.has("loginError")) {
                state.searchParams.delete("loginError");
            }
            url.searchParams.set("state", state.toString());

            if (apiKeyInjection.partner === "ory" || apiKeyInjection.partner === "webflow") {
                const redirect_uri = urlJoin(window.location.origin, callbackApiRoute);
                url.searchParams.set("redirect_uri", redirect_uri);
            }

            window.location.replace(url);
        } else {
            isOpen.toggleValue();
        }
    };

    const authButtonCopy = apiKeyInjection.enabled
        ? "Login to send a real request"
        : `Authenticate with your ${
              auth.type === "oAuth"
                  ? oAuth.selectedInputMethod === "credentials"
                      ? "credentials"
                      : "bearer token"
                  : "API key"
          } to send a real request`;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const { loginError } = router.query;
        if (loginError) {
            setLoginError(loginError as string);
        }
    }, [router.query, router.isReady]);

    // TODO change this to on-login
    useEffect(() => {
        if (apiKey != null) {
            setBearerAuth({ token: apiKey });
        }
    }, [apiKey, setBearerAuth]);

    return (
        <div>
            {apiKeyInjection.enabled && apiKey == null && (
                <>
                    <FernCard className="rounded-xl p-4 shadow-sm mb-2">
                        {loginError && <Callout intent="error">{loginError}</Callout>}

                        <h5 className="t-muted m-0">Login to send a real request</h5>
                        <div className="flex justify-center my-5 gap-2">
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
                                onClick={() => isOpen.toggleValue()}
                            />
                        </div>
                    </FernCard>
                </>
            )}
            {apiKeyInjection.enabled && apiKey != null && (
                <>
                    <FernCard className="rounded-xl p-4 shadow-sm mb-3" title="Login to send a real request">
                        <FernButton
                            className="w-full text-left pointer-events-none"
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
                                closeContainer={isOpen.setFalse}
                                disabled={disabled}
                            />
                        </div>
                        {
                            <div className="flex justify-end  gap-2">
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
                                {apiKeyInjection && (
                                    <FernButton
                                        text="Logout"
                                        intent="none"
                                        onClick={() => {
                                            const url = new URL(urlJoin(window.location.origin, logoutApiRoute));
                                            const state = new URL(window.location.href);
                                            url.searchParams.set("state", state.toString());
                                            fetch(url)
                                                .then(() => {
                                                    window.location.reload();
                                                })
                                                .catch((error) => {
                                                    // eslint-disable-next-line no-console
                                                    console.error(error);
                                                });
                                        }}
                                        size="normal"
                                        variant="outlined"
                                    />
                                )}
                            </div>
                        }
                    </FernCard>
                </>
            )}
            {!apiKeyInjection.enabled && (isAuthed(auth, authState) || apiKey != null) && (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="success"
                    variant="outlined"
                    text={authButtonCopy}
                    icon={<Key />}
                    rightIcon={
                        <span className="flex items-center rounded-[4px] bg-tag-success p-1 font-mono text-xs uppercase leading-none text-intent-success">
                            Authenticated
                        </span>
                    }
                    onClick={isOpen.toggleValue}
                    active={isOpen.value}
                />
            )}
            {!apiKeyInjection.enabled && !(isAuthed(auth, authState) || apiKey != null) && (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="danger"
                    variant="outlined"
                    text={authButtonCopy}
                    icon={<Key />}
                    rightIcon={
                        <span className="flex items-center rounded-[4px] bg-tag-danger p-1 font-mono text-xs uppercase leading-none text-intent-danger">
                            Not Authenticated
                        </span>
                    }
                    onClick={redirectOrOpenAuthForm}
                    active={isOpen.value}
                />
            )}

            <FernCollapse open={isOpen.value}>
                <div className="pt-4">
                    <div className="fern-dropdown max-h-full">
                        <PlaygroundAuthorizationForm auth={auth} closeContainer={isOpen.setFalse} disabled={disabled} />

                        <div className="flex justify-end p-4 pt-2 gap-2">
                            {auth.type !== "oAuth" && (
                                <FernButton text="Done" intent="primary" onClick={isOpen.setFalse} />
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

function isAuthed(auth: APIV1Read.ApiAuth, authState: PlaygroundAuthState): boolean {
    return visitDiscriminatedUnion(auth)._visit({
        bearerAuth: () => !isEmpty(authState.bearerAuth?.token.trim()),
        basicAuth: () =>
            !isEmpty(authState.basicAuth?.username.trim()) && !isEmpty(authState.basicAuth?.password.trim()),
        header: (header) => !isEmpty(authState.header?.headers[header.headerWireValue]?.trim()),
        oAuth: () => {
            const authToken =
                authState.oauth?.selectedInputMethod === "credentials"
                    ? authState.oauth?.accessToken
                    : authState.oauth?.userSuppliedAccessToken;
            return authToken ? !isEmpty(authToken.trim()) : false;
        },
        _other: () => false,
    });
}
