import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ApiDefinitionId,
    ApiDefinitionV1ToLatest,
    AuthSchemeId,
    CodeSnippet,
    EndpointDefinition,
    ExampleEndpointCall,
    ExampleEndpointRequest,
    Transformer,
    prune,
    type ApiDefinition,
    type PruningNodeType,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { unknownToString, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DEFAULT_FEATURE_FLAGS, provideRegistryService, type FeatureFlags } from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { HTTPSnippet, type HarRequest, type TargetId } from "httpsnippet-lite";
import { buildRequestUrl } from "../../../app/src/playground/utils/url";
import { ApiDefinitionKVCache } from "./ApiDefinitionCache";

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

export class ApiDefinitionLoader {
    public static create = (xFernHost: string, apiDefinitionId: ApiDefinitionId): ApiDefinitionLoader => {
        return new ApiDefinitionLoader(xFernHost, apiDefinitionId);
    };

    private constructor(
        private xFernHost: string,
        private apiDefinitionId: ApiDefinitionId,
    ) {}

    private flags: FeatureFlags = DEFAULT_FEATURE_FLAGS;
    public withFlags = (flags: FeatureFlags): ApiDefinitionLoader => {
        this.flags = flags;
        return this;
    };

    private prune: PruningNodeType[] = [];

    public withPrune = (prune: PruningNodeType): ApiDefinitionLoader => {
        this.prune.push(prune);
        return this;
    };

    private resolve: boolean = false;
    public withResolveDescriptions = (): ApiDefinitionLoader => {
        this.resolve = true;
        return this;
    };

    public load = async (): Promise<ApiDefinition | undefined> => {
        const v1 = await provideRegistryService().api.v1.read.getApi(this.apiDefinitionId);

        if (!v1.ok) {
            if (v1.error.error === "ApiDoesNotExistError") {
                return undefined;
            } else {
                // eslint-disable-next-line no-console
                console.error(v1.error.content);
                throw new Error("Failed to load API definition");
            }
        }

        let definition = ApiDefinitionV1ToLatest.from(v1.body, this.flags).migrate();

        if (this.prune.length > 0) {
            definition = prune(definition, ...this.prune);
        }

        if (this.resolve) {
            definition = await this.resolveDescriptions(definition);
        }

        if (this.flags.isHttpSnippetsEnabled) {
            definition = await this.resolveHttpCodeSnippets(definition);
        }

        return definition;
    };

    private resolveHttpCodeSnippets = async (apiDefinition: ApiDefinition): Promise<ApiDefinition> => {
        return await Transformer.with({
            EndpointDefinition: async (endpoint) => {
                if (!endpoint.examples || endpoint.examples.length === 0) {
                    return endpoint;
                }

                const examples = await Promise.all(
                    endpoint.examples.map((example) => this.resolveExample(apiDefinition, endpoint, example)),
                );

                return { ...endpoint, examples };
            },
        }).apiDefinition(apiDefinition);
    };

    private resolveExample = async (
        apiDefinition: ApiDefinition,
        endpoint: EndpointDefinition,
        example: ExampleEndpointCall,
    ): Promise<ExampleEndpointCall> => {
        const snippets = { ...example.snippets };

        const pushSnippet = (snippet: CodeSnippet) => {
            (snippets[snippet.language] ??= []).push(snippet);
        };

        const snippet = new HTTPSnippet(getHarRequest(endpoint, example, apiDefinition.auths, example.requestBody));
        for (const { clientId, targetId } of CLIENTS) {
            if (!this.flags.alwaysEnableJavaScriptFetch) {
                if (snippets[targetId]?.length) {
                    continue;
                }

                if (targetId === "javascript" && snippets["typescript"]?.length) {
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
                pushSnippet({
                    name: this.flags.alwaysEnableJavaScriptFetch ? "HTTP Request" : undefined,
                    language: targetId,
                    install: undefined,
                    code,
                    generated: true,
                    description: undefined,
                });
            }
        }

        return { ...example, snippets };
    };

    private resolveDescriptions = async (apiDefinition: ApiDefinition): Promise<ApiDefinition> => {
        const cache = ApiDefinitionKVCache.getInstance(this.xFernHost, this.apiDefinitionId);

        // TODO: pass in other tsx/mdx files to serializeMdx options
        const engine = this.flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
        const serializeMdx = await getMdxBundler(engine);

        // TODO: batch resolved descriptions to avoid multiple round-trip requests to KV
        const cachedTransformer = (description: FernDocs.MarkdownText, key: string) => {
            return cache.resolveDescription(description, `${engine}/${key}`, (description) =>
                serializeMdx(description),
            );
        };

        const transformed = await Transformer.descriptions(cachedTransformer).apiDefinition(apiDefinition);

        return transformed;
    };
}

function getHarRequest(
    endpoint: EndpointDefinition,
    example: ExampleEndpointCall,
    auths: Record<AuthSchemeId, APIV1Read.ApiAuth>,
    requestBody: ExampleEndpointRequest | undefined,
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
        (endpoint?.environments?.find((env) => env.id === endpoint.defaultEnvironment) ?? endpoint?.environments?.[0])
            ?.baseUrl,
        endpoint.path,
        example.pathParameters,
    );
    request.method = endpoint.method;
    request.queryString = Object.entries(example.queryParameters ?? {}).map(([name, value]) => ({
        name,
        value: unknownToString(value),
    }));
    request.headers = Object.entries(example.headers ?? {}).map(([name, value]) => ({
        name,
        value: unknownToString(value),
    }));

    let mimeType = endpoint.request?.contentType as string | undefined;

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
                    for (const fileName of value.value) {
                        request.postData.params.push({
                            name,
                            fileName,
                        });
                    }
                } else if (value.type === "filenamesWithData") {
                    for (const { filename } of value.value) {
                        request.postData.params.push({
                            name,
                            fileName: filename,
                        });
                    }
                }
            }
        } else if (requestBody.type === "bytes") {
            // TODO: verify this is correct
            request.postData.params = [{ name: "file", value: requestBody.value.value }];
        }
    }

    const auth = endpoint.auth?.[0] != null ? auths[endpoint.auth[0]] : undefined;

    if (auth != null) {
        visitDiscriminatedUnion(auth)._visit({
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
                });
            },
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
