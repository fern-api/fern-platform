import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { SnippetTemplateResolver } from "@fern-api/template-resolver";
import { UnreachableCaseError } from "ts-essentials";
import { ResolvedEndpointDefinition, stringifyResolvedEndpointPathPartsTemplate } from "../../resolver/types";
import { provideRegistryService } from "../../services/registry";
import { PlaygroundAuthState, PlaygroundEndpointRequestFormState } from "../types";
import { buildAuthHeaders, convertToCustomSnippetPayload } from "../utils";
import { CurlSnippetBuilder } from "./builders/curl";
import { PythonRequestSnippetBuilder } from "./builders/python";
import { TypescriptFetchSnippetBuilder } from "./builders/typescript";

export class PlaygroundCodeSnippetResolverBuilder {
    constructor(
        private endpoint: ResolvedEndpointDefinition,
        private isSnippetTemplatesEnabled: boolean,
        private isFileForgeHackEnabled: boolean,
    ) {}

    public create(
        authState: PlaygroundAuthState,
        formState: PlaygroundEndpointRequestFormState,
        proxyEnvironment: string,
        setOAuthValue: (value: (prev: any) => any) => void,
    ): PlaygroundCodeSnippetResolver {
        return new PlaygroundCodeSnippetResolver(
            this.endpoint,
            authState,
            formState,
            false,
            this.isSnippetTemplatesEnabled,
            this.isFileForgeHackEnabled,
            proxyEnvironment,
            setOAuthValue,
        );
    }

    public createRedacted(
        authState: PlaygroundAuthState,
        formState: PlaygroundEndpointRequestFormState,
        proxyEnvironment: string,
        setOAuthValue: (value: (prev: any) => any) => void,
    ): PlaygroundCodeSnippetResolver {
        return new PlaygroundCodeSnippetResolver(
            this.endpoint,
            authState,
            formState,
            true,
            this.isSnippetTemplatesEnabled,
            this.isFileForgeHackEnabled,
            proxyEnvironment,
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
        public endpoint: ResolvedEndpointDefinition,
        authState: PlaygroundAuthState,
        private formState: PlaygroundEndpointRequestFormState,
        isAuthHeadersRedacted: boolean,
        public isSnippetTemplatesEnabled: boolean,
        private isFileForgeHackEnabled: boolean,
        proxyEnvironment: string,
        setOAuthValue: (value: (prev: any) => any) => void,
    ) {
        const authHeaders = buildAuthHeaders(
            endpoint.auth,
            authState,
            { redacted: isAuthHeadersRedacted },
            {
                formState,
                endpoint,
                proxyEnvironment,
                setValue: setOAuthValue,
            },
        );

        this.headers = { ...authHeaders, ...formState.headers };

        if (endpoint.method !== "GET" && endpoint.requestBody?.contentType != null) {
            this.headers["Content-Type"] = endpoint.requestBody.contentType;
        }

        if (isSnippetTemplatesEnabled && endpoint.snippetTemplates != null) {
            if (endpoint.snippetTemplates.typescript != null) {
                this.typescriptSdkResolver = new SnippetTemplateResolver({
                    payload: convertToCustomSnippetPayload(formState),
                    endpointSnippetTemplate: {
                        sdk: {
                            type: "typescript",
                            package: "",
                            version: "",
                        },
                        endpointId: {
                            path: stringifyResolvedEndpointPathPartsTemplate(endpoint.path),
                            method: endpoint.method,
                        },
                        snippetTemplate: endpoint.snippetTemplates.typescript,
                    },
                    provideFdrClient: provideRegistryService,
                });
            }

            if (endpoint.snippetTemplates.python != null) {
                this.pythonRequestsResolver = new SnippetTemplateResolver({
                    payload: convertToCustomSnippetPayload(formState),
                    endpointSnippetTemplate: {
                        sdk: {
                            type: "python",
                            package: "",
                            version: "",
                        },
                        endpointId: {
                            path: stringifyResolvedEndpointPathPartsTemplate(endpoint.path),
                            method: endpoint.method,
                        },
                        snippetTemplate: endpoint.snippetTemplates.python,
                    },
                    provideFdrClient: provideRegistryService,
                });
            }
        }
    }

    public toCurl(): string {
        const formState = { ...this.formState, headers: this.headers };
        return new CurlSnippetBuilder(this.endpoint, formState)
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
        return new TypescriptFetchSnippetBuilder(this.endpoint, formState).build();
    }

    public toPythonRequests(): string {
        const formState = { ...this.formState, headers: this.headers };
        return new PythonRequestSnippetBuilder(this.endpoint, formState).build();
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
