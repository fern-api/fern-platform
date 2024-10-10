import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { compact } from "lodash-es";
import { noop } from "ts-essentials";
import urljoin from "url-join";
import { ResolvedEndpointDefinition, ResolvedExampleEndpointRequest } from "../../resolver/types";
import { getEndpointEnvironmentUrl } from "../../util/endpoint";

export interface HttpRequestExample {
    method: string;
    url: string;
    urlQueries: Record<string, unknown>;
    headers: Record<string, unknown>;
    basicAuth?: {
        username: string;
        password: string;
    };
    body: ResolvedExampleEndpointRequest | null | undefined;
}

export function convertEndpointExampleToHttpRequestExample(
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | null | undefined,
): HttpRequestExample {
    const environmentUrl = getEndpointEnvironmentUrl(endpoint);
    const url = urljoin(compact([environmentUrl, example.path]));

    const headers: Record<string, unknown> = { ...example.headers };

    let basicAuth: { username: string; password: string } | undefined;

    if (endpoint.auth != null) {
        visitDiscriminatedUnion(endpoint.auth, "type")._visit({
            basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                basicAuth = { username: `<${usernameName}>`, password: `<${passwordName}>` };
            },
            bearerAuth: ({ tokenName = "token" }) => {
                headers.Authorization = `Bearer <${tokenName}>`;
            },
            header: ({ headerWireValue, nameOverride = headerWireValue, prefix }) => {
                headers[headerWireValue] = prefix != null ? `${prefix} <${nameOverride}>` : `<${nameOverride}>`;
            },
            oAuth: ({ value: clientCredentials }) => {
                visitDiscriminatedUnion(clientCredentials, "type")._visit({
                    clientCredentials: () => {
                        headers.Authorization = "Bearer <token>";
                    },
                    _other: noop,
                });
            },
            _other: noop,
        });
    }

    const body: ResolvedExampleEndpointRequest | null | undefined = requestBody;

    if (endpoint.requestBody?.contentType != null) {
        headers["Content-Type"] = endpoint.requestBody?.contentType;
    }

    if (body != null && headers["Content-Type"] == null) {
        if (body.type === "json") {
            headers["Content-Type"] = "application/json";
        } else if (body.type === "form") {
            headers["Content-Type"] = "multipart/form-data";
        }
    }

    return {
        method: endpoint.method,
        url,
        urlQueries: example.queryParameters,
        headers: JSON.parse(JSON.stringify(headers)),
        basicAuth,
        body,
    };
}
