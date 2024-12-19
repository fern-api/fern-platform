import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernCard } from "@fern-ui/components";
import { APIKeyInjectionConfigEnabled } from "@fern-ui/fern-docs-auth";
import { Key, User } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { ReactElement, useEffect } from "react";
import urlJoin from "url-join";
import { PLAYGROUND_AUTH_STATE_ATOM, PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM, useApiRoute } from "../../atoms";
import { Callout } from "../../mdx/components/callout";
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
}: PlaygroundCardTriggerApiKeyInjectedProps): ReactElement | false {
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
                    <PlaygroundAuthorizationForm auth={auth} closeContainer={onClose} disabled={disabled} />
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
                        <FernButton
                            text="Logout"
                            intent="none"
                            onClick={() => {
                                if (!config.authenticated) {
                                    return;
                                }
                                const url = new URL(urlJoin(window.location.origin, logoutApiRoute));
                                const returnTo = new URL(window.location.href);
                                url.searchParams.set(config.returnToQueryParam, returnTo.toString());
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
                    </div>
                }
            </FernCard>
        );
    }

    return (
        <FernCard className="rounded-xl p-4 shadow-sm mb-2">
            {error && <Callout intent="error">{errorDescription ?? error}</Callout>}

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
                    onClick={toggleOpen}
                />
            </div>
        </FernCard>
    );
}
