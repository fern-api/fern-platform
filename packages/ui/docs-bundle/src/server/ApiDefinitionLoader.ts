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
