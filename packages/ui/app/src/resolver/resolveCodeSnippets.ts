import { cleanLanguage } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { unknownToString, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { HTTPSnippet, type HarRequest, type TargetId } from "httpsnippet-lite";
import { noop } from "ts-essentials";
import { convertEndpointExampleToHttpRequestExample } from "../api-reference/examples/HttpRequestExample";
import { stringifyHttpRequestExampleToCurl } from "../api-reference/examples/stringifyHttpRequestExampleToCurl";
import {
    ResolvedCodeSnippet,
    ResolvedEndpointDefinition,
    ResolvedExampleEndpointRequest,
    resolveEnvironment,
} from "./types";
import { buildRequestUrl } from "./url";

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
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | undefined,
    isHttpSnippetsEnabled: boolean,
    useJavaScriptAsTypeScript: boolean,
    alwaysEnableJavaScriptFetch: boolean,
    playgroundEnvironment?: string,
): Promise<ResolvedCodeSnippet[]> {
    let toRet: ResolvedCodeSnippet[] = [];

    const curlCode = stringifyHttpRequestExampleToCurl(
        convertEndpointExampleToHttpRequestExample(endpoint, example, requestBody),
    );
    toRet.push({
        name: undefined,
        language: "curl",
        install: undefined,
        code: unknownToString(curlCode),
        // hast: highlight(highlighter, curlCode, "bash"),
        generated: true,
    });

    if (example.codeExamples.pythonSdk != null) {
        toRet.push({
            name: undefined,
            language: "python",
            install: example.codeExamples.pythonSdk.install,
            code: example.codeExamples.pythonSdk.sync_client,
            // hast: highlight(highlighter, code, "python"),
            generated: true,
        });
    }

    if (example.codeExamples.typescriptSdk != null) {
        toRet.push({
            name: alwaysEnableJavaScriptFetch ? `${useJavaScriptAsTypeScript ? "Java" : "Type"}Script SDK` : undefined,
            language: useJavaScriptAsTypeScript ? "javascript" : "typescript",
            install: example.codeExamples.typescriptSdk.install,
            code: example.codeExamples.typescriptSdk.client,
            // hast: highlight(highlighter, code, "typescript"),
            generated: true,
        });
    }

    if (example.codeExamples.goSdk != null) {
        toRet.push({
            name: undefined,
            language: "go",
            install: example.codeExamples.goSdk.install,
            code: example.codeExamples.goSdk.client,
            // hast: highlight(highlighter, code, "go"),
            generated: true,
        });
    }

    if (example.codeExamples.rubySdk != null) {
        toRet.push({
            name: undefined,
            language: "ruby",
            install: example.codeExamples.rubySdk.install,
            code: example.codeExamples.rubySdk.client,
            // hast: highlight(highlighter, code, "ruby"),
            generated: true,
        });
    }

    example.codeSamples.forEach((codeSample) => {
        const language = cleanLanguage(codeSample.language);

        if (!alwaysEnableJavaScriptFetch) {
            // Remove any generated code snippets with the same language
            toRet = toRet.filter((snippet) => (snippet.generated ? snippet.language !== language : true));
        }

        toRet.push({
            name: codeSample.name,
            language,
            install: codeSample.install,
            code: codeSample.code,
            // hast: highlight(highlighter, code, language),
            generated: false,
        });
    });

    try {
        if (isHttpSnippetsEnabled) {
            const snippet = new HTTPSnippet(getHarRequest(endpoint, example, requestBody, playgroundEnvironment));
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
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }

    return toRet;
}

function getHarRequest(
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | undefined,
    playgroundEnvironment: string | undefined,
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
    request.url = buildRequestUrl(
        playgroundEnvironment ?? resolveEnvironment(endpoint)?.baseUrl,
        endpoint.path,
        example.pathParameters,
    );
    request.method = endpoint.method;
    request.queryString = Object.entries(example.queryParameters).map(([name, value]) => ({
        name,
        value: unknownToString(value),
    }));
    request.headers = Object.entries(example.headers).map(([name, value]) => ({ name, value: unknownToString(value) }));

    let mimeType = endpoint.requestBody?.contentType as string | undefined;

    if (requestBody != null) {
        if (mimeType == null) {
            mimeType = requestBody.type === "json" ? "application/json" : "multipart/form-data";
        }
        request.postData = {
            mimeType,
        };

        if (requestBody.type === "json") {
            request.postData.text = JSON.stringify(requestBody.value, null, 2);
        } else if (requestBody.type === "form") {
            request.postData.params = [];

            for (const [name, value] of Object.entries(requestBody.value)) {
                if (value.type === "json") {
                    request.postData.params.push({
                        name,
                        value: JSON.stringify(value.value, null, 2),
                    });
                } else if (value.type === "file") {
                    request.postData.params.push({
                        name,
                        fileName: value.fileName,
                    });
                } else if (value.type === "fileArray") {
                    for (const fileName of value.files) {
                        request.postData.params.push({
                            name,
                            fileName: fileName.fileName,
                        });
                    }
                }
            }
        } else if (requestBody.type === "bytes") {
            // TODO: verify this is correct
            request.postData.params = [{ name: "file", fileName: requestBody.fileName }];
        }
    }

    if (endpoint.auth != null) {
        visitDiscriminatedUnion(endpoint.auth, "type")._visit({
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
