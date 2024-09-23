import { unknownToString, visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { HTTPSnippet, type HarRequest, type TargetId } from "httpsnippet-lite";
import { UnreachableCaseError, noop } from "ts-essentials";
import { buildRequestUrl } from "../playground/utils";

interface HTTPSnippetClient {
    targetId: TargetId;
    clientId: string;
}

const CLIENTS: HTTPSnippetClient[] = [
    { targetId: "python", clientId: "requests" },
    { targetId: "javascript", clientId: "fetch" },
    { targetId: "go", clientId: "native" },
    { targetId: "ruby", clientId: "native" },
    { targetId: "java", clientId: "unirest" },
    { targetId: "php", clientId: "guzzle" },
    { targetId: "csharp", clientId: "restsharp" },
    { targetId: "swift", clientId: "nsurlsession" },
];

export async function resolveCodeSnippets(
    endpoint: ApiDefinition.EndpointDefinition,
    example: ApiDefinition.ExampleEndpointCall,
    auth: ApiDefinition.ApiDefinition["auth"],
    alwaysEnableJavaScriptFetch: boolean,
): Promise<ApiDefinition.CodeSnippet[]> {
    const toRet: ApiDefinition.CodeSnippet[] = [];

    try {
        const snippet = new HTTPSnippet(getHarRequest(endpoint, example, auth));
        for (const { clientId, targetId } of CLIENTS) {
            if (!alwaysEnableJavaScriptFetch) {
                if (toRet.some((snippet) => cleanLanguage(snippet.language) === targetId)) {
                    continue;
                }

                if (
                    targetId === "javascript" &&
                    toRet.some((snippet) => cleanLanguage(snippet.language) === "typescript")
                ) {
                    continue;
                }
            }

            const convertedCode = await snippet.convert(targetId, clientId);
            const code =
                typeof convertedCode === "string"
                    ? convertedCode
                    : convertedCode != null
                      ? convertedCode[0]
                      : undefined;
            if (code != null) {
                toRet.push({
                    name: alwaysEnableJavaScriptFetch ? "HTTP Request" : undefined,
                    language: targetId,
                    install: undefined,
                    code,
                    generated: true,
                });
            }
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }

    return toRet;
}

function cleanLanguage(language: string): string {
    language = language.toLowerCase().trim();
    if (["node", "nodejs", "js", "javascript"].includes(language)) {
        return "javascript";
    }

    if (["py", "python"].includes(language)) {
        return "python";
    }

    if (["ts", "typescript", "ts-node"].includes(language)) {
        return "typescript";
    }

    if (["go", "golang"].includes(language)) {
        return "go";
    }

    return language;
}

function getHarRequest(
    endpoint: ApiDefinition.EndpointDefinition,
    example: ApiDefinition.ExampleEndpointCall,
    auth: ApiDefinition.ApiDefinition["auth"],
): HarRequest {
    const request: HarRequest = {
        httpVersion: "1.1",
        method: "GET",
        url: "",
        headers: [],
        headersSize: -1,
        queryString: [],
        cookies: [],
        bodySize: -1,
    };
    const baseUrl = endpoint.environments.find((env, idx) =>
        endpoint.defaultEnvironment != null ? env.id === endpoint.defaultEnvironment : idx === 0,
    )?.baseUrl;
    request.url = buildRequestUrl(baseUrl, endpoint.path, example.pathParameters);
    request.method = endpoint.method;
    request.queryString = Object.entries(example.queryParameters).map(([name, value]) => ({
        name,
        value: unknownToString(value),
    }));
    request.headers = Object.entries(example.headers).map(([name, value]) => ({ name, value: unknownToString(value) }));

    let mimeType = endpoint.request?.contentType as string | undefined;

    if (example.requestBody != null) {
        if (mimeType == null) {
            mimeType = example.requestBody.type === "json" ? "application/json" : "multipart/form-data";
        }
        request.postData = {
            mimeType,
        };

        if (example.requestBody.type === "json") {
            request.postData.text = JSON.stringify(example.requestBody.value, null, 2);
        } else if (example.requestBody.type === "form") {
            request.postData.params = [];

            for (const [name, value] of Object.entries(example.requestBody.value)) {
                if (value.type === "json") {
                    request.postData.params.push({
                        name,
                        value: JSON.stringify(value.value, null, 2),
                    });
                } else if (value.type === "filename") {
                    request.postData.params.push({
                        name,
                        fileName: value.value,
                    });
                } else if (value.type === "filenameWithData") {
                    request.postData.params.push({
                        name,
                        fileName: value.filename,
                    });
                } else if (value.type === "filenames") {
                    for (const filename of value.value) {
                        request.postData.params.push({
                            name,
                            fileName: filename,
                        });
                    }
                } else if (value.type === "filenamesWithData") {
                    for (const { filename } of value.value) {
                        request.postData.params.push({
                            name,
                            fileName: filename,
                        });
                    }
                } else {
                    throw new UnreachableCaseError(value);
                }
            }
        } else if (example.requestBody.type === "bytes") {
            // TODO: verify this is correct
            request.postData.params = [{ name: "file", fileName: requestBody.fileName }];
        }
    }

    if (endpoint.authed && auth != null) {
        visitDiscriminatedUnion(auth, "type")._visit({
            basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                request.headers.push({
                    name: "Authorization",
                    value: `Basic <${usernameName}>:<${passwordName}>`,
                });
            },
            bearerAuth: ({ tokenName = "token" }) => {
                request.headers.push({
                    name: "Authorization",
                    value: `Bearer <${tokenName}>`,
                });
            },
            header: ({ headerWireValue, nameOverride = headerWireValue, prefix }) => {
                request.headers.push({
                    name: headerWireValue,
                    value: prefix != null ? `${prefix} <${nameOverride}>` : `<${nameOverride}>`,
                });
            },
            oAuth: (oAuth) => {
                visitDiscriminatedUnion(oAuth.value, "type")._visit({
                    clientCredentials: (clientCredentials) => {
                        visitDiscriminatedUnion(clientCredentials.value, "type")._visit({
                            referencedEndpoint: () => {
                                request.headers.push({
                                    name: "Authorization",
                                    value: "Bearer <token>",
                                });
                            },
                        });
                    },
                    _other: noop,
                });
            },
            _other: noop,
        });
    }

    if (mimeType != null) {
        request.headers.push({
            name: "Content-Type",
            value: mimeType,
        });
    }

    return request;
}
