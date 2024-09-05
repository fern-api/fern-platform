import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernCard, FernCollapse, FernInput } from "@fern-ui/components";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Key, User } from "iconoir-react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { isEmpty } from "lodash-es";
import { useRouter } from "next/router";
import { FC, ReactElement, SetStateAction, useCallback, useEffect, useState } from "react";
import urlJoin from "url-join";
import { useMemoOne } from "use-memo-one";
import mapValue from "../../../../fdr-sdk/src/utils/lodash/mapValues";
import {
    PLAYGROUND_AUTH_STATE_ATOM,
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM,
    PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
    PLAYGROUND_AUTH_STATE_HEADER_ATOM,
    PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
    useFlattenedApis,
    usePlaygroundEndpointFormState,
} from "../atoms";
import { useApiRoute } from "../hooks/useApiRoute";
import { useStandardProxyEnvironment } from "../hooks/useStandardProxyEnvironment";
import { Callout } from "../mdx/components/callout";
import { ResolvedApiEndpointWithPackage, ResolvedEndpointDefinition } from "../resolver/types";
import { useApiKeyInjectionConfig } from "../services/useApiKeyInjectionConfig";
import { unknownToString } from "../util/unknownToString";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { serializeFormStateBody } from "./PlaygroundEndpoint";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { executeProxyRest } from "./fetch-utils/executeProxyRest";
import { PlaygroundAuthState, PlaygroundEndpointRequestFormState, ProxyRequest } from "./types";
import { buildEndpointUrl } from "./utils";

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

export interface OAuthClientCredentialLoginFlowProps {
    formState: PlaygroundEndpointRequestFormState;
    endpoint: ResolvedApiEndpointWithPackage.Endpoint | ResolvedEndpointDefinition;
    proxyEnvironment: string;
    oAuth: APIV1Read.ApiAuth.OAuth;
    setValue: (value: (prev: any) => any) => void;
    closeContainer?: () => void;
    setDisplayFailedLogin?: (value: boolean) => void;
}

export const oAuthClientCredentialLoginFlow = async ({
    formState,
    endpoint,
    proxyEnvironment,
    oAuth,
    setValue,
    closeContainer,
    setDisplayFailedLogin,
}: OAuthClientCredentialLoginFlowProps): Promise<void> => {
    const headers: Record<string, string> = {
        ...mapValue(formState.headers ?? {}, unknownToString),
    };

    if (endpoint.method !== "GET" && endpoint.requestBody?.contentType != null) {
        headers["Content-Type"] = endpoint.requestBody.contentType;
    }

    const req: ProxyRequest = {
        url: buildEndpointUrl(endpoint, formState),
        method: endpoint.method,
        headers,
        body: await serializeFormStateBody("", endpoint.requestBody?.shape, formState.body, false),
    };
    const res = await executeProxyRest(proxyEnvironment, req);

    const mutableAccessTokenLocationCopy = [...oAuth.value.accessTokenLocation];
    visitDiscriminatedUnion(res, "type")._visit({
        json: (jsonRes) => {
            if (jsonRes.response.ok) {
                const container = mutableAccessTokenLocationCopy.shift();
                if (container == null || (container !== "body" && container !== "headers")) {
                    throw new Error("Expected access location to be defined");
                }
                let cursor: any = jsonRes.response[container];
                for (const accessor of mutableAccessTokenLocationCopy) {
                    if (accessor in cursor) {
                        cursor = cursor[accessor];
                    }
                }
                setValue((prev) => ({ ...prev, accessToken: cursor }));
                closeContainer && closeContainer();
            } else {
                setDisplayFailedLogin && setDisplayFailedLogin(true);
            }
        },
        file: () => {
            setDisplayFailedLogin && setDisplayFailedLogin(true);
        },
        stream: () => {
            setDisplayFailedLogin && setDisplayFailedLogin(true);
        },
        _other: () => {
            setDisplayFailedLogin && setDisplayFailedLogin(true);
        },
    });
};

function OAuthForm({
    oAuth,
    closeContainer,
    disabled,
}: {
    oAuth: APIV1Read.ApiAuth.OAuth;
    closeContainer: () => void;
    disabled?: boolean;
}) {
    // Client Credential hooks
    const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
    const proxyEnvironment = useStandardProxyEnvironment();
    const apis = useFlattenedApis();
    const [displayFailedLogin, setDisplayFailedLogin] = useState(false);

    const endpointSlug = oAuth.value.tokenEndpointPath.startsWith("/")
        ? oAuth.value.tokenEndpointPath.slice(1)
        : oAuth.value.tokenEndpointPath;

    let endpoint: ResolvedApiEndpointWithPackage.Endpoint | null = null;
    let types = null;

    for (const node of Object.values(apis)) {
        endpoint = node.endpoints.find((e) => e.slug === endpointSlug) as ResolvedApiEndpointWithPackage.Endpoint;
        if (endpoint) {
            types = apis[endpoint?.apiDefinitionId ?? ""]?.types;
            break;
        }
    }
    if (endpoint == null || types == null) {
        return <Callout intent="error">{"Could not find the endpoint to leverage the OAuth login flow"}</Callout>;
    } else {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [formState, setFormState] = usePlaygroundEndpointFormState(endpoint);

        const oAuthClientCredentialLogin = async () =>
            await oAuthClientCredentialLoginFlow({
                formState,
                endpoint,
                proxyEnvironment,
                oAuth,
                setValue,
                closeContainer,
                setDisplayFailedLogin,
            });

        return (
            <>
                <li className="-mx-4 space-y-2 p-4 pb-2">
                    <label className="inline-flex flex-wrap items-baseline">
                        <span className="font-mono text-sm">{"OAuth Client Credentials login"}</span>
                    </label>
                    <PlaygroundEndpointForm
                        endpoint={endpoint}
                        formState={formState}
                        setFormState={setFormState}
                        types={types}
                        ignoreHeaders={true}
                    />
                </li>
                <li className="-mx-4 space-y-2 p-4 pt-0">
                    {value.accessToken.length > 0 && (
                        <>
                            <label className="inline-flex flex-wrap items-baseline">
                                <span className="font-mono text-sm">
                                    {oAuth.value.tokenPrefix != null
                                        ? `${oAuth.value.tokenPrefix} token`
                                        : "Bearer token"}
                                </span>
                            </label>

                            <div>
                                <PasswordInputGroup
                                    onValueChange={(newValue: string) =>
                                        setValue((prev) => ({ ...prev, accessToken: newValue }))
                                    }
                                    value={value.accessToken}
                                    autoComplete="off"
                                    data-1p-ignore="true"
                                    disabled={disabled}
                                />
                            </div>
                        </>
                    )}
                </li>
                {displayFailedLogin && (
                    <li className="-mx-4 space-y-2 p-4 py-0">
                        <span className="font-mono text-sm text-red-600">
                            Failed to login with the provided credentials
                        </span>
                    </li>
                )}
                <li className="flex justify-end py-2">
                    <FernButton
                        text={value.accessToken.length > 0 ? "Refresh token" : "Login"}
                        intent="primary"
                        onClick={oAuthClientCredentialLogin}
                        disabled={disabled}
                    />
                </li>
            </>
        );
    }
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

            if (apiKeyInjection.partner === "ory") {
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
        : "Authenticate with your API key to send a real request";

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
                    text="Authenticate with your API key to send a real request"
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

            <FernCollapse isOpen={isOpen.value}>
                <div className="pt-4">
                    <div className="fern-dropdown !max-h-[350px]">
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
        oAuth: () => !isEmpty(authState.oauth?.accessToken.trim()),
        _other: () => false,
    });
}
