import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ApiDefinitionId,
    ApiDefinitionV1ToLatest,
    Transformer,
    prune,
    type ApiDefinition,
    type CodeSnippet,
    type EndpointDefinition,
    type ExampleEndpointCall,
    type PruningNodeType,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { DEFAULT_FEATURE_FLAGS, provideRegistryService, type FeatureFlags } from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { HTTPSnippet, type TargetId } from "httpsnippet-lite";
import { UnreachableCaseError } from "ts-essentials";
import { ApiDefinitionKVCache } from "./ApiDefinitionCache";
import { getHarRequest } from "./getHarRequest";

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

    private cache: ApiDefinitionKVCache;
    private constructor(
        xFernHost: string,
        private apiDefinitionId: ApiDefinitionId,
    ) {
        this.cache = ApiDefinitionKVCache.getInstance(xFernHost, apiDefinitionId);
    }

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

    private apiDefinition: ApiDefinition | undefined;
    public withApiDefinition = (definition: ApiDefinition): ApiDefinitionLoader => {
        this.apiDefinition = definition;
        return this;
    };

    #getApi = async (): Promise<ApiDefinition | undefined> => {
        if (this.apiDefinition != null) {
            return this.apiDefinition;
        }

        // NOTE: this cannot be cached because the API definition often exceeds the 1MB limit
        // let apiDefinition = await this.cache.getApiDefinition();
        // if (apiDefinition != null) {
        //     return apiDefinition;
        // }

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

        return ApiDefinitionV1ToLatest.from(v1.body, this.flags).migrate();
        // await this.cache.setApiDefinition(apiDefinition);
        // return apiDefinition;
    };

    public load = async (): Promise<ApiDefinition | undefined> => {
        let definition = this.apiDefinition;

        // If we have a single prune node, we can attempt to load it from the cache
        if ((definition == null && this.prune.length) === 1 && this.prune[0] != null) {
            definition = (await this.cache.getApiDefinition(getPruneKey(this.prune[0]))) ?? undefined;

            if (definition == null) {
                definition = await this.#getApi();

                if (definition == null) {
                    return undefined;
                }

                definition = prune(definition, this.prune[0]);
                await this.cache.setApiDefinition(definition, getPruneKey(this.prune[0]));
            }
        }

        // If we have multiple prune nodes, we can't load from the cache, and we need to load the full API definition + prune it
        else if (this.prune.length > 0) {
            definition = await this.#getApi();

            if (definition == null) {
                return definition;
            }

            definition = prune(definition, ...this.prune);
        }

        // If we don't have any prune nodes, we can load the full API definition
        else {
            definition = await this.#getApi();

            if (definition == null) {
                return definition;
            }
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
            /**
             * If the snippet already exists, skip it
             */
            if (snippets[targetId]?.length) {
                continue;
            }

            /**
             * If alwaysEnableJavaScriptFetch is disabled, skip generating JavaScript snippets if TypeScript snippets are available
             */
            if (
                targetId === "javascript" &&
                snippets[APIV1Read.SupportedLanguage.Typescript]?.length &&
                !this.flags.alwaysEnableJavaScriptFetch
            ) {
                continue;
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
                    name: "HTTP Request",
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
        // TODO: pass in other tsx/mdx files to serializeMdx options
        const engine = this.flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
        const serializeMdx = await getMdxBundler(engine);

        const descriptions = await this.#collectDescriptions(apiDefinition, engine);
        const resolvedDescriptions = await this.cache.batchResolveDescriptions(descriptions, serializeMdx);
        const transformed = await this.#transformDescriptions(apiDefinition, resolvedDescriptions, engine);

        return transformed;
    };

    /**
     * Collect all descriptions to resolve, so that we can resolve all of them in a single batch
     *
     * @param apiDefinition The API definition to collect descriptions from
     * @param engine to prefix the key, so that we can differentiate between different serialization engines
     */
    #collectDescriptions = async (
        apiDefinition: ApiDefinition,
        engine: string,
    ): Promise<Record<string, FernDocs.MarkdownText>> => {
        const descriptions: Record<string, FernDocs.MarkdownText> = {};
        const descriptionCollector = (description: FernDocs.MarkdownText, key: string) => {
            if (descriptions[`${engine}/${key}`] != null) {
                // eslint-disable-next-line no-console
                console.error(`Duplicate description key: ${key}!`);
                return description;
            }
            descriptions[`${engine}/${key}`] = description;
            return description;
        };
        await Transformer.descriptions(descriptionCollector).apiDefinition(apiDefinition);
        return descriptions;
    };

    #transformDescriptions = async (
        apiDefinition: ApiDefinition,
        descriptions: Record<string, FernDocs.MarkdownText>,
        engine: string,
    ): Promise<ApiDefinition> => {
        const transformer = (description: FernDocs.MarkdownText, key: string) => {
            return descriptions[`${engine}/${key}`] ?? description;
        };

        return await Transformer.descriptions(transformer).apiDefinition(apiDefinition);
    };
}

function getPruneKey(prune: PruningNodeType): string {
    switch (prune.type) {
        case "endpoint":
            return `prune-endpoint-${prune.endpointId}`;
        case "webSocket":
            return `prune-websocket-${prune.webSocketId}`;
        case "webhook":
            return `prune-auth-${prune.webhookId}`;
        default:
            throw new UnreachableCaseError(prune);
    }
}
