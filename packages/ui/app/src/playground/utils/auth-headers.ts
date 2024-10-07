import { APIV1Read } from "@fern-api/fdr-sdk";
import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { decodeJwt } from "jose";
import { noop } from "ts-essentials";
import { PlaygroundAuthState } from "../types";
import {
    OAuthClientCredentialReferencedEndpointLoginFlowProps,
    oAuthClientCredentialReferencedEndpointLoginFlow,
} from "./oauth";
import { obfuscateSecret } from "./obfuscate-secret";

export function buildAuthHeaders(
    auth: APIV1Read.ApiAuth | undefined,
    authState: PlaygroundAuthState,
    { redacted }: { redacted: boolean },
    oAuthClientCredentialReferencedEndpointLoginFlowProps?: Omit<
        OAuthClientCredentialReferencedEndpointLoginFlowProps,
        "oAuthClientCredentialsReferencedEndpoint"
    >,
): Record<string, string> {
    const headers: Record<string, string> = {};

    if (auth != null) {
        visitDiscriminatedUnion(auth)._visit({
            bearerAuth: () => {
                let token = authState.bearerAuth?.token ?? "";
                if (redacted) {
                    token = obfuscateSecret(token);
                }
                headers["Authorization"] = `Bearer ${token}`;
            },
            header: (header) => {
                let value = authState.header?.headers[header.headerWireValue] ?? "";
                if (redacted) {
                    value = obfuscateSecret(value);
                }
                headers[header.headerWireValue] = header.prefix != null ? `${header.prefix} ${value}` : value;
            },
            basicAuth: () => {
                const username = authState.basicAuth?.username ?? "";
                let password = authState.basicAuth?.password ?? "";
                if (redacted) {
                    password = obfuscateSecret(password);
                }
                headers["Authorization"] = `Basic ${btoa(`${username}:${obfuscateSecret(password)}`)}`;
            },
            oAuth: (oAuth) => {
                visitDiscriminatedUnion(oAuth.value)._visit({
                    clientCredentials: (oAuthClientCredentials) => {
                        visitDiscriminatedUnion(oAuthClientCredentials.value)._visit({
                            referencedEndpoint: (oAuthClientCredentialsReferencedEndpoint) => {
                                const token =
                                    authState.oauth?.selectedInputMethod === "credentials"
                                        ? authState.oauth?.accessToken
                                        : authState.oauth?.userSuppliedAccessToken ?? "";

                                if (oAuthClientCredentialReferencedEndpointLoginFlowProps && token) {
                                    const {
                                        formState,
                                        endpoint,
                                        proxyEnvironment,
                                        baseUrl,
                                        setValue: setOAuthValue,
                                    } = oAuthClientCredentialReferencedEndpointLoginFlowProps;
                                    try {
                                        const payload = decodeJwt(token);
                                        if (payload.exp && new Date().getTime() > payload.exp) {
                                            oAuthClientCredentialReferencedEndpointLoginFlow({
                                                formState,
                                                endpoint,
                                                proxyEnvironment,
                                                oAuthClientCredentialsReferencedEndpoint,
                                                baseUrl,
                                                setValue: setOAuthValue,
                                            }).catch(noop);
                                        }
                                    } catch {}
                                }

                                const tokenPrefix = authState.oauth?.tokenPrefix?.length
                                    ? authState.oauth.tokenPrefix
                                    : "Bearer";
                                if (redacted) {
                                    headers["Authorization"] = `${tokenPrefix} ${obfuscateSecret(token)}`;
                                } else {
                                    headers["Authorization"] = `${tokenPrefix} ${token}`;
                                }
                            },
                        });
                    },
                });
            },
        });
    }

    return headers;
}
