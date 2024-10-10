import type { APIV1Read } from "@fern-api/fdr-sdk";
import { buildEndpointUrl, type EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { unknownToString, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import jsonpath from "jsonpath";
import { mapValues } from "lodash-es";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { PlaygroundEndpointRequestFormState, ProxyRequest } from "../types";
import { serializeFormStateBody } from "./serialize";

export interface OAuthClientCredentialReferencedEndpointLoginFlowProps {
    formState: PlaygroundEndpointRequestFormState;
    endpoint: EndpointDefinition;
    proxyEnvironment: string;
    oAuthClientCredentialsReferencedEndpoint: APIV1Read.OAuthClientCredentialsReferencedEndpoint;
    baseUrl: string | undefined;
    setValue: (value: (prev: any) => any) => void;
    closeContainer?: () => void;
    setDisplayFailedLogin?: (value: boolean) => void;
}

export const oAuthClientCredentialReferencedEndpointLoginFlow = async ({
    formState,
    endpoint,
    proxyEnvironment,
    oAuthClientCredentialsReferencedEndpoint,
    baseUrl,
    setValue,
    closeContainer,
    setDisplayFailedLogin,
}: OAuthClientCredentialReferencedEndpointLoginFlowProps): Promise<void> => {
    if (typeof window === "undefined") {
        return;
    }

    const headers: Record<string, string> = {
        ...mapValues(formState.headers ?? {}, (value) => unknownToString(value)),
    };

    if (endpoint.method !== "GET" && endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request.contentType;
    }

    const req: ProxyRequest = {
        url: buildEndpointUrl({
            endpoint,
            pathParameters: formState.pathParameters,
            queryParameters: formState.queryParameters,
            baseUrl,
        }),
        method: endpoint.method,
        headers,
        body: await serializeFormStateBody("", endpoint.request?.body, formState.body, false),
    };
    const res = await executeProxyRest(proxyEnvironment, req);

    await visitDiscriminatedUnion(res, "type")._visit<void | Promise<void>>({
        json: async (jsonRes) => {
            if (jsonRes.response.ok) {
                try {
                    const accessToken = jsonpath.query(
                        jsonRes.response,
                        oAuthClientCredentialsReferencedEndpoint.accessTokenLocator,
                    )?.[0];
                    setValue((prev) => ({
                        ...prev,
                        selectedInputMethod: "credentials",
                        accessToken,
                        isLoggedIn: true,
                        loggedInStartingToken: accessToken,
                    }));
                    setTimeout(() => closeContainer && closeContainer(), 500);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    closeContainer && closeContainer();
                }
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
