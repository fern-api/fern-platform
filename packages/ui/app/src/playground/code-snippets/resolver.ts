import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { toCurlyBraceEndpointPathLiteral } from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { SnippetTemplateResolver } from "@fern-api/template-resolver";
import { UnreachableCaseError } from "ts-essentials";
import { provideRegistryService } from "../../services/registry";
import { PlaygroundAuthState, PlaygroundEndpointRequestFormState } from "../types";
import { buildAuthHeaders, convertToCustomSnippetPayload } from "../utils";
import { CurlSnippetBuilder } from "./builders/curl";
import { PythonRequestSnippetBuilder } from "./builders/python";
import { TypescriptFetchSnippetBuilder } from "./builders/typescript";

export class PlaygroundCodeSnippetResolverBuilder {
    constructor(
        private context: EndpointContext,
        private isSnippetTemplatesEnabled: boolean,
        private isFileForgeHackEnabled: boolean,
    ) {}

    public create(
        authState: PlaygroundAuthState,
        formState: PlaygroundEndpointRequestFormState,
        proxyEnvironment: string,
        playgroundEnvironment: string | undefined,
        setOAuthValue: (value: (prev: any) => any) => void,
    ): PlaygroundCodeSnippetResolver {
        return new PlaygroundCodeSnippetResolver(
            this.context,
            authState,
            formState,
            false,
            this.isSnippetTemplatesEnabled,
            this.isFileForgeHackEnabled,
            proxyEnvironment,
            playgroundEnvironment,
            setOAuthValue,
        );
    }

    public createRedacted(
        authState: PlaygroundAuthState,
        formState: PlaygroundEndpointRequestFormState,
        proxyEnvironment: string,
        playgroundEnvironment: string | undefined,
        setOAuthValue: (value: (prev: any) => any) => void,
    ): PlaygroundCodeSnippetResolver {
        return new PlaygroundCodeSnippetResolver(
            this.context,
            authState,
            formState,
            true,
            this.isSnippetTemplatesEnabled,
            this.isFileForgeHackEnabled,
            proxyEnvironment,
            playgroundEnvironment,
            setOAuthValue,
        );
    }
}

export class PlaygroundCodeSnippetResolver {
    // TODO: use Headers class for case-insensitive keyes
    private headers: Record<string, unknown> = {};
    private typescriptSdkResolver: SnippetTemplateResolver | undefined;
    private pythonRequestsResolver: SnippetTemplateResolver | undefined;

    public resolve(
        lang: "curl" | "python" | "typescript" | "javascript",
        apiDefinition?: APIV1Read.ApiDefinition,
    ): string {
        if (lang === "curl") {
            return this.toCurl();
        } else if (lang === "typescript" || lang === "javascript") {
            return this.toTypescriptSdkSnippet(apiDefinition) ?? this.toTypescriptFetch();
        } else if (lang === "python") {
            return this.toPythonSdkSnippet(apiDefinition) ?? this.toPythonRequests();
        } else {
            throw new UnreachableCaseError(lang);
        }
    }

    constructor(
        public context: EndpointContext,
        private authState: PlaygroundAuthState,
        private formState: PlaygroundEndpointRequestFormState,
        isAuthHeadersRedacted: boolean,
        public isSnippetTemplatesEnabled: boolean,
        private isFileForgeHackEnabled: boolean,
        proxyEnvironment: string,
        private baseUrl: string | undefined,
        setOAuthValue: (value: (prev: any) => any) => void,
    ) {
        const authHeaders = buildAuthHeaders(
            this.context.auth,
            authState,
            { redacted: isAuthHeadersRedacted },
            {
                formState,
                endpoint: this.context.endpoint,
                proxyEnvironment,
                baseUrl: this.baseUrl,
                setValue: setOAuthValue,
            },
        );

        this.headers = { ...authHeaders, ...formState.headers };

        if (this.context.endpoint.method !== "GET" && this.context.endpoint.request?.contentType != null) {
            this.headers["Content-Type"] = this.context.endpoint.request.contentType;
        }

        if (isSnippetTemplatesEnabled && this.context.endpoint.snippetTemplates != null) {
            if (this.context.endpoint.snippetTemplates.typescript != null) {
                this.typescriptSdkResolver = new SnippetTemplateResolver({
                    payload: convertToCustomSnippetPayload(formState, authState),
                    endpointSnippetTemplate: {
                        sdk: {
                            type: "typescript",
                            package: "",
                            version: "",
                        },
                        endpointId: {
                            path: toCurlyBraceEndpointPathLiteral(this.context.endpoint.path),
                            method: this.context.endpoint.method,
                            identifierOverride: undefined,
                        },
                        snippetTemplate: this.context.endpoint.snippetTemplates.typescript,
                        apiDefinitionId: undefined,
                        additionalTemplates: undefined,
                    },
                    provideFdrClient: provideRegistryService,
                });
            }

            if (this.context.endpoint.snippetTemplates.python != null) {
                this.pythonRequestsResolver = new SnippetTemplateResolver({
                    payload: convertToCustomSnippetPayload(formState, authState),
                    endpointSnippetTemplate: {
                        sdk: {
                            type: "python",
                            package: "",
                            version: "",
                        },
                        endpointId: {
                            path: toCurlyBraceEndpointPathLiteral(this.context.endpoint.path),
                            method: this.context.endpoint.method,
                            identifierOverride: undefined,
                        },
                        snippetTemplate: this.context.endpoint.snippetTemplates.python,
                        apiDefinitionId: undefined,
                        additionalTemplates: undefined,
                    },
                    provideFdrClient: provideRegistryService,
                });
            }
        }
    }

    public toCurl(): string {
        const formState = { ...this.formState, headers: this.headers };
        return new CurlSnippetBuilder(this.context, formState, this.authState, this.baseUrl)
            .setFileForgeHackEnabled(this.isFileForgeHackEnabled)
            .build();
    }

    public toTypescriptFetch(): string {
        const headers = { ...this.headers };

        // TODO: ensure case insensitivity
        if (headers["Content-Type"] === "multipart/form-data") {
            delete headers["Content-Type"]; // fetch will set this automatically
        }

        const formState = { ...this.formState, headers };
        return new TypescriptFetchSnippetBuilder(this.context, formState, this.authState, this.baseUrl).build();
    }

    public toPythonRequests(): string {
        const formState = { ...this.formState, headers: this.headers };
        return new PythonRequestSnippetBuilder(this.context, formState, this.authState, this.baseUrl).build();
    }

    public toTypescriptSdkSnippet(apiDefinition?: APIV1Read.ApiDefinition): string | undefined {
        if (this.typescriptSdkResolver == null) {
            return undefined;
        }

        const resolvedTemplate = this.typescriptSdkResolver.resolve(apiDefinition);

        if (resolvedTemplate.type === "typescript") {
            return resolvedTemplate.client;
        }
        return undefined;
    }

    public toPythonSdkSnippet(apiDefinition?: APIV1Read.ApiDefinition): string | undefined {
        if (this.pythonRequestsResolver == null) {
            return undefined;
        }

        const resolvedTemplate = this.pythonRequestsResolver.resolve(apiDefinition);

        if (resolvedTemplate.type === "python") {
            return resolvedTemplate.sync_client;
        }
        return undefined;
    }
}
