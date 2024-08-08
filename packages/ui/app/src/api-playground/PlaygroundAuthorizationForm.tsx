import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernCard, FernCollapse, FernInput } from "@fern-ui/components";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { GlobeIcon, PersonIcon } from "@radix-ui/react-icons";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { isEmpty } from "lodash-es";
import { useRouter } from "next/router";
import { FC, ReactElement, SetStateAction, useCallback, useEffect, useState } from "react";
import { Key } from "react-feather";
import { useMemoOne } from "use-memo-one";
import {
    PLAYGROUND_AUTH_STATE_ATOM,
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM,
    PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
    PLAYGROUND_AUTH_STATE_HEADER_ATOM,
} from "../atoms";
import { Callout } from "../mdx/components/callout";
import { useApiKeyInjectionConfig } from "../services/useApiKeyInjectionConfig";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundAuthState } from "./types";

interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    disabled: boolean;
}

function BearerAuthForm({ bearerAuth, disabled }: { bearerAuth: APIV1Read.BearerAuth; disabled?: boolean }) {
    const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
    const handleChange = useCallback((newValue: string) => setValue({ token: newValue }), [setValue]);

    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            handleChange(secret.token);
        },
        [closeSecretsModal, handleChange],
    );

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
                    rightElement={
                        <FernButton
                            onClick={openSecretsModal}
                            icon={<GlobeIcon className="size-4" />}
                            variant="minimal"
                        />
                    }
                    disabled={disabled}
                />
            </div>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen && !disabled}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
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
    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            handleChangePassword(secret.token);
        },
        [closeSecretsModal, handleChangePassword],
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
                        leftIcon={<PersonIcon className="size-4" />}
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
                        rightElement={
                            <FernButton
                                onClick={openSecretsModal}
                                icon={<GlobeIcon className="size-4" />}
                                variant="minimal"
                            />
                        }
                        disabled={disabled}
                    />
                </div>
            </li>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen && !disabled}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
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
    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            setValue(secret.token);
        },
        [closeSecretsModal, setValue],
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
                    rightElement={
                        <FernButton
                            onClick={openSecretsModal}
                            icon={<GlobeIcon className="size-4" />}
                            variant="minimal"
                        />
                    }
                    disabled={disabled}
                />
            </div>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen && !disabled}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </li>
    );
}

export const PlaygroundAuthorizationForm: FC<PlaygroundAuthorizationFormProps> = ({ auth, disabled }) => {
    return (
        <ul className="list-none px-4">
            {visitDiscriminatedUnion(auth, "type")._visit({
                bearerAuth: (bearerAuth) => <BearerAuthForm bearerAuth={bearerAuth} disabled={disabled} />,
                basicAuth: (basicAuth) => <BasicAuthForm basicAuth={basicAuth} disabled={disabled} />,
                header: (header) => <HeaderAuthForm header={header} disabled={disabled} />,
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

    const redirectOrOpenAuthForm = () => {
        if (apiKeyInjection.enabled && !apiKeyInjection.authenticated) {
            // const redirect_uri =  urlJoin(window.location.origin, basePath ?? "", "/api/fern-docs/auth/login"),
            const url = new URL(apiKeyInjection.url);
            const state = new URL(window.location.href);
            if (state.searchParams.has("loginError")) {
                state.searchParams.delete("loginError");
            }
            url.searchParams.set("state", state.toString());
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
                                icon={<PersonIcon />}
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
                            <PlaygroundAuthorizationForm auth={auth} disabled={disabled} />
                        </div>
                        {apiKey !== authState?.bearerAuth?.token && (
                            <div className="flex justify-end  gap-2">
                                {apiKey && (
                                    <FernButton
                                        text="Reset token to default"
                                        intent="none"
                                        icon={<Key />}
                                        onClick={handleResetBearerAuth}
                                        size="normal"
                                        variant="outlined"
                                    />
                                )}
                            </div>
                        )}
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
                            Connect
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
                            Connect
                        </span>
                    }
                    onClick={redirectOrOpenAuthForm}
                    active={isOpen.value}
                />
            )}
            <FernCollapse isOpen={isOpen.value}>
                <div className="pt-4">
                    <div className="fern-dropdown">
                        <PlaygroundAuthorizationForm auth={auth} disabled={disabled} />

                        <div className="flex justify-end p-4 pt-2 gap-2">
                            <FernButton text="Done" intent="primary" onClick={isOpen.setFalse} />
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
        _other: () => false,
    });
}
