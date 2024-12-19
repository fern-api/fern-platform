import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { decodeJwt } from "jose";
import { noop } from "ts-essentials";
import { PlaygroundAuthState } from "../types";
import { pascalCaseHeaderKey } from "./header-key-case";
import {
    OAuthClientCredentialReferencedEndpointLoginFlowProps,
    oAuthClientCredentialReferencedEndpointLoginFlow,
} from "./oauth";
import { obfuscateSecret } from "./obfuscate-secret";

export function buildAuthHeaders(
    auth: ApiDefinition.AuthScheme | undefined,
    authState: PlaygroundAuthState,
    { redacted }: { redacted: boolean },
    oAuthClientCredentialReferencedEndpointLoginFlowProps?: Omit<
        OAuthClientCredentialReferencedEndpointLoginFlowProps,
        "referencedEndpoint"
    >
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
                // pluck the value from the headers object (avoid inheriting all the other headers)
                let value =
                    authState.header?.headers[
                        pascalCaseHeaderKey(header.headerWireValue)
                    ] ?? "";
                if (redacted) {
                    value = obfuscateSecret(value);
                }
                headers[pascalCaseHeaderKey(header.headerWireValue)] =
                    header.prefix != null ? `${header.prefix} ${value}` : value;
            },
            basicAuth: () => {
                const username = authState.basicAuth?.username ?? "";
                let password = authState.basicAuth?.password ?? "";
                if (redacted) {
                    password = obfuscateSecret(password);
                }
                headers["Authorization"] =
                    `Basic ${btoa(`${username}:${obfuscateSecret(password)}`)}`;
            },
            oAuth: (oAuth) => {
                visitDiscriminatedUnion(oAuth.value)._visit({
                    clientCredentials: (oAuthClientCredentials) => {
                        visitDiscriminatedUnion(
                            oAuthClientCredentials.value
                        )._visit({
                            referencedEndpoint: (referencedEndpoint) => {
                                const token =
                                    authState.oauth?.selectedInputMethod ===
                                    "credentials"
                                        ? authState.oauth?.accessToken
                                        : authState.oauth
                                              ?.userSuppliedAccessToken ?? "";

                                if (
                                    oAuthClientCredentialReferencedEndpointLoginFlowProps &&
                                    token
                                ) {
                                    const {
                                        formState,
                                        endpoint,
                                        proxyEnvironment,
                                        baseUrl,
                                        setValue: setOAuthValue,
                                    } = oAuthClientCredentialReferencedEndpointLoginFlowProps;
                                    try {
                                        const payload = decodeJwt(token);
                                        if (
                                            payload.exp &&
                                            new Date().getTime() > payload.exp
                                        ) {
                                            oAuthClientCredentialReferencedEndpointLoginFlow(
                                                {
                                                    formState,
                                                    endpoint,
                                                    proxyEnvironment,
                                                    referencedEndpoint,
                                                    baseUrl,
                                                    setValue: setOAuthValue,
                                                }
                                            ).catch(noop);
                                        }
                                    } catch {}
                                }

                                const tokenPrefix =
                                    oAuthClientCredentials.value.tokenPrefix ??
                                    "Bearer";

                                headers[
                                    pascalCaseHeaderKey(
                                        oAuthClientCredentials.value
                                            .headerName || "Authorization"
                                    )
                                ] =
                                    `${tokenPrefix.length ? `${tokenPrefix} ` : ""}${redacted ? obfuscateSecret(token) : token}`;
                            },
                        });
                    },
                });
            },
        });
    }

    return headers;
}
