import { APIV1Read, visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import { unknownToString } from "@fern-ui/core-utils";
import jsonpath from "jsonpath";
import { mapValues } from "lodash-es";
import { ResolvedEndpointDefinition } from "../../resolver/types";
import { executeProxyRest } from "../fetch-utils/executeProxyRest";
import { PlaygroundEndpointRequestFormState, ProxyRequest } from "../types";
import { serializeFormStateBody } from "./serialize";
import { buildEndpointUrl } from "./url";

export interface OAuthClientCredentialReferencedEndpointLoginFlowProps {
    formState: PlaygroundEndpointRequestFormState;
    endpoint: ResolvedEndpointDefinition;
    proxyEnvironment: string;
    oAuthClientCredentialsReferencedEndpoint: APIV1Read.OAuthClientCredentialsReferencedEndpoint;
    setValue: (value: (prev: any) => any) => void;
    closeContainer?: () => void;
    setDisplayFailedLogin?: (value: boolean) => void;
}

export const oAuthClientCredentialReferencedEndpointLoginFlow = async ({
    formState,
    endpoint,
    proxyEnvironment,
    oAuthClientCredentialsReferencedEndpoint,
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
