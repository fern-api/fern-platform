import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { noop } from "lodash-es";
import { buildRequestUrl } from "../../api-playground/utils";
import { getEndpointEnvironmentUrl } from "../../util/endpoint";
import { ResolvedEndpointDefinition, ResolvedExampleEndpointRequest } from "../../util/resolver";

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
    const url = buildRequestUrl(environmentUrl, endpoint.path, example.pathParameters);

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
            _other: noop,
        });
    }

    const body: ResolvedExampleEndpointRequest | null | undefined = requestBody;

    if (endpoint.requestBody[0]?.contentType != null) {
        headers["Content-Type"] = endpoint.requestBody[0]?.contentType;
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
