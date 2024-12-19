import { APIV1Read, FdrClient } from "@fern-api/fdr-sdk";
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
import type { FeatureFlags } from "@fern-docs/utils";
import { DEFAULT_FEATURE_FLAGS } from "@fern-docs/utils";
import { HTTPSnippet, type TargetId } from "httpsnippet-lite";
import { UnreachableCaseError } from "ts-essentials";
import { ApiDefinitionKVCache } from "./ApiDefinitionKVCache";
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
    public clone = (): ApiDefinitionLoader => {
        return new ApiDefinitionLoader(this.domain, this.apiDefinitionId)
            .withFlags(this.flags)
            .withEnvironment(this.environment)
            .withPrune(...this.prune)
            .withResolveDescriptions(this.resolve)
            .withApiDefinition(this.apiDefinition)
            .withMdxBundler(this.#serializeMdx, this.#engine);
    };

    public static create = (
        domain: string,
        apiDefinitionId: ApiDefinitionId
    ): ApiDefinitionLoader => {
        return new ApiDefinitionLoader(domain, apiDefinitionId);
    };

    private environment: string | undefined;
    public withEnvironment = (
        environment: string | undefined
    ): ApiDefinitionLoader => {
        this.environment = environment;
        return this;
    };

    private cache: ApiDefinitionKVCache;
    private constructor(
        private domain: string,
        private apiDefinitionId: ApiDefinitionId
    ) {
        this.cache = ApiDefinitionKVCache.getInstance(domain, apiDefinitionId);
    }

    private flags: FeatureFlags = DEFAULT_FEATURE_FLAGS;
    public withFlags = (flags: Partial<FeatureFlags>): ApiDefinitionLoader => {
        this.flags = { ...this.flags, ...flags };
        return this;
    };

    private prune: PruningNodeType[] = [];

    public withPrune = (...prune: PruningNodeType[]): ApiDefinitionLoader => {
        this.prune.push(...prune);
        return this;
    };

    private resolve: boolean = false;
    public withResolveDescriptions = (resolve = true): ApiDefinitionLoader => {
        this.resolve = resolve;
        return this;
    };

    private apiDefinition: ApiDefinition | undefined;
    public withApiDefinition = (
        definition: ApiDefinition | undefined
    ): ApiDefinitionLoader => {
        this.apiDefinition = definition;
        return this;
    };

    #getClient = () =>
        new FdrClient({
            environment: this.environment,
            token: process.env.FERN_TOKEN,
        });
    #getApi = async (): Promise<ApiDefinition | undefined> => {
        if (this.apiDefinition != null) {
            return this.apiDefinition;
        }

        // NOTE: this cannot be cached because the API definition often exceeds the 1MB limit
        // let apiDefinition = await this.cache.getApiDefinition();
        // if (apiDefinition != null) {
        //     return apiDefinition;
        // }

        const v1 = await this.#getClient().api.v1.read.getApi(
            this.apiDefinitionId
        );
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
        if (
            (definition == null && this.prune.length) === 1 &&
            this.prune[0] != null
        ) {
            definition =
                (await this.cache.getApiDefinition(
                    getPruneKey(this.prune[0])
                )) ?? undefined;

            if (definition == null) {
                definition = await this.#getApi();

                if (definition == null) {
                    return undefined;
                }

                definition = prune(definition, this.prune[0]);
                await this.cache.setApiDefinition(
                    definition,
                    getPruneKey(this.prune[0])
                );
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

    private resolveHttpCodeSnippets = async (
        apiDefinition: ApiDefinition
    ): Promise<ApiDefinition> => {
        // Collect all endpoints first, so that we can resolve descriptions in a single batch
        const collected: EndpointDefinition[] = [];
        Transformer.with({
            EndpointDefinition: (endpoint) => {
                collected.push(endpoint);
                return endpoint;
            },
        }).apiDefinition(apiDefinition);

        // Resolve example code snippets in parallel
        const result = Object.fromEntries(
            await Promise.all(
                collected.map(async (endpoint) => {
                    if (
                        endpoint.examples == null ||
                        endpoint.examples.length === 0
                    ) {
                        return [endpoint.id, endpoint] as const;
                    }

                    const examples = await Promise.all(
                        endpoint.examples.map((example) =>
                            this.resolveExample(
                                apiDefinition,
                                endpoint,
                                example
                            )
                        )
                    );

                    return [endpoint.id, { ...endpoint, examples }] as const;
                })
            )
        );

        // reduce the api definition with newly resolved examples
        return {
            ...apiDefinition,
            endpoints: { ...apiDefinition.endpoints, ...result },
        };
    };

    private resolveExample = async (
        apiDefinition: ApiDefinition,
        endpoint: EndpointDefinition,
        example: ExampleEndpointCall
    ): Promise<ExampleEndpointCall> => {
        const snippets = { ...example.snippets };

        const pushSnippet = (snippet: CodeSnippet) => {
            (snippets[snippet.language] ??= []).push(snippet);
        };

        const snippet = new HTTPSnippet(
            getHarRequest(
                endpoint,
                example,
                apiDefinition.auths,
                example.requestBody
            )
        );
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
                    name: undefined,
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

    #serializeMdx = async (mdx: string): Promise<FernDocs.MarkdownText> =>
        Promise.resolve(mdx);
    #engine = "raw";
    public withMdxBundler = (
        fn: (mdx: string) => Promise<FernDocs.MarkdownText>,
        engine: string
    ): ApiDefinitionLoader => {
        this.#serializeMdx = fn;
        this.#engine = engine;
        return this;
    };

    private resolveDescriptions = async (
        apiDefinition: ApiDefinition
    ): Promise<ApiDefinition> => {
        const descriptions = this.#collectDescriptions(apiDefinition);
        const resolvedDescriptions = await this.cache.batchResolveDescriptions(
            descriptions,
            this.#serializeMdx
        );
        const transformed = this.#transformDescriptions(
            apiDefinition,
            resolvedDescriptions
        );

        return transformed;
    };

    /**
     * Collect all descriptions to resolve, so that we can resolve all of them in a single batch
     *
     * @param apiDefinition The API definition to collect descriptions from
     * @param engine to prefix the key, so that we can differentiate between different serialization engines
     */
    #collectDescriptions = (
        apiDefinition: ApiDefinition
    ): Record<string, FernDocs.MarkdownText> => {
        const descriptions: Record<string, FernDocs.MarkdownText> = {};
        const descriptionCollector = (
            description: FernDocs.MarkdownText,
            key: string
        ) => {
            if (descriptions[`${this.#engine}/${key}`] != null) {
                // eslint-disable-next-line no-console
                console.error(`Duplicate description key: ${key}!`);
                return description;
            }
            descriptions[`${this.#engine}/${key}`] = description;
            return description;
        };
        Transformer.descriptions(descriptionCollector).apiDefinition(
            apiDefinition
        );
        return descriptions;
    };

    #transformDescriptions = (
        apiDefinition: ApiDefinition,
        descriptions: Record<string, FernDocs.MarkdownText>
    ): ApiDefinition => {
        const transformer = (
            description: FernDocs.MarkdownText,
            key: string
        ) => {
            return descriptions[`${this.#engine}/${key}`] ?? description;
        };

        return Transformer.descriptions(transformer).apiDefinition(
            apiDefinition
        );
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
