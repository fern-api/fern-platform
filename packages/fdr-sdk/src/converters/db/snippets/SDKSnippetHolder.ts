import { APIV1Read, APIV1Write, FdrAPI } from "../../../client";

export interface SnippetsConfigWithSdkId {
    typescriptSdk?: APIV1Write.TypescriptPackage & { sdkId: string };
    pythonSdk?: APIV1Write.PythonPackage & { sdkId: string };
    goSdk?: APIV1Write.GoModule & { sdkId: string };
    javaSdk?: APIV1Write.JavaCoordinate & { sdkId: string };
    rubySdk?: APIV1Write.RubyGem & { sdkId: string };
}

export interface SdkSnippetHolderArgs {
    // Legacy format for snippets leveraging path and method (which is not unique enough for some cases)
    snippetsBySdkId: Record<string, Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>>;
    // If these are present for the SDK ID, use these, otherwise use snippetsBySdkId
    snippetsBySdkIdAndEndpointId: Record<string, Record<string, FdrAPI.Snippet[]>>;
    snippetsConfigWithSdkId: SnippetsConfigWithSdkId;
    snippetTemplatesByEndpoint: Record<
        FdrAPI.EndpointPath,
        Record<FdrAPI.EndpointMethod, APIV1Read.EndpointSnippetTemplates>
    >;
    snippetTemplatesByEndpointId: Record<string, APIV1Read.EndpointSnippetTemplates>;
}

export class SDKSnippetHolder {
    private snippetsBySdkId: Record<string, Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>>;
    private snippetsBySdkIdAndEndpointId: Record<string, Record<string, FdrAPI.Snippet[]>>;
    private snippetsConfigWithSdkId: SnippetsConfigWithSdkId;
    private snippetTemplatesByEndpoint: Record<
        FdrAPI.EndpointPath,
        Record<FdrAPI.EndpointMethod, APIV1Read.EndpointSnippetTemplates>
    >;
    private snippetTemplatesByEndpointId: Record<string, APIV1Read.EndpointSnippetTemplates>;

    constructor({
        snippetsBySdkId,
        snippetsConfigWithSdkId,
        snippetTemplatesByEndpoint,
        snippetsBySdkIdAndEndpointId,
        snippetTemplatesByEndpointId,
    }: SdkSnippetHolderArgs) {
        this.snippetsBySdkId = snippetsBySdkId;
        this.snippetsConfigWithSdkId = snippetsConfigWithSdkId;
        this.snippetTemplatesByEndpoint = snippetTemplatesByEndpoint;
        this.snippetsBySdkIdAndEndpointId = snippetsBySdkIdAndEndpointId;
        this.snippetTemplatesByEndpointId = snippetTemplatesByEndpointId;
    }

    public getPythonCodeSnippetForEndpoint({
        endpointPath,
        endpointMethod,
        identifierOverride,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
        identifierOverride: string | undefined;
    }): APIV1Read.PythonSnippet | undefined {
        if (this.snippetsConfigWithSdkId.pythonSdk == null) {
            return undefined;
        }

        const sdkId = this.snippetsConfigWithSdkId.pythonSdk.sdkId;
        let snippetsForEndpoint;
        if (identifierOverride != null) {
            snippetsForEndpoint = this.snippetsBySdkIdAndEndpointId[sdkId]?.[identifierOverride];
        }

        if (identifierOverride == null || this.snippetsBySdkIdAndEndpointId[sdkId] == null) {
            snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        }

        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 1) {
            return undefined;
        }
        if (snippetsForEndpoint[0]?.type !== "python") {
            return undefined;
        }
        return {
            install: undefined, // TODO: add install snippet
            async_client: snippetsForEndpoint[0]?.async_client,
            sync_client: snippetsForEndpoint[0]?.sync_client,
        };
    }

    public getTypeScriptCodeSnippetForEndpoint({
        endpointPath,
        endpointMethod,
        identifierOverride,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
        identifierOverride: string | undefined;
    }): APIV1Read.TypescriptSnippet | undefined {
        if (this.snippetsConfigWithSdkId.typescriptSdk == null) {
            return undefined;
        }

        const sdkId = this.snippetsConfigWithSdkId.typescriptSdk.sdkId;
        let snippetsForEndpoint;
        if (identifierOverride != null) {
            snippetsForEndpoint = this.snippetsBySdkIdAndEndpointId[sdkId]?.[identifierOverride];
        }

        if (identifierOverride == null || this.snippetsBySdkIdAndEndpointId[sdkId] == null) {
            snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        }

        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 1) {
            return undefined;
        }
        if (snippetsForEndpoint[0]?.type !== "typescript") {
            return undefined;
        }
        return {
            install: undefined, // TODO: add install snippet
            client: snippetsForEndpoint[0]?.client,
        };
    }

    public getGoCodeSnippetForEndpoint({
        endpointPath,
        endpointMethod,
        identifierOverride,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
        identifierOverride: string | undefined;
    }): APIV1Read.GoSnippet | undefined {
        if (this.snippetsConfigWithSdkId.goSdk == null) {
            return undefined;
        }

        const sdkId = this.snippetsConfigWithSdkId.goSdk.sdkId;
        let snippetsForEndpoint;
        if (identifierOverride != null) {
            snippetsForEndpoint = this.snippetsBySdkIdAndEndpointId[sdkId]?.[identifierOverride];
        }

        if (identifierOverride == null || this.snippetsBySdkIdAndEndpointId[sdkId] == null) {
            snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        }

        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 1) {
            return undefined;
        }
        if (snippetsForEndpoint[0]?.type !== "go") {
            return undefined;
        }
        return {
            install: undefined, // TODO: add install snippet
            client: snippetsForEndpoint[0]?.client,
        };
    }

    public getRubyCodeSnippetForEndpoint({
        endpointPath,
        endpointMethod,
        identifierOverride,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
        identifierOverride: string | undefined;
    }): APIV1Read.RubySnippet | undefined {
        if (this.snippetsConfigWithSdkId.rubySdk == null) {
            return undefined;
        }

        const sdkId = this.snippetsConfigWithSdkId.rubySdk.sdkId;
        let snippetsForEndpoint;
        if (identifierOverride != null) {
            snippetsForEndpoint = this.snippetsBySdkIdAndEndpointId[sdkId]?.[identifierOverride];
        }

        if (identifierOverride == null || this.snippetsBySdkIdAndEndpointId[sdkId] == null) {
            snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        }

        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 1) {
            return undefined;
        }
        if (snippetsForEndpoint[0]?.type !== "ruby") {
            return undefined;
        }
        return {
            install: undefined, // TODO: add install snippet
            client: snippetsForEndpoint[0]?.client,
        };
    }

    public getSnippetTemplateForEndpoint({
        endpointPath,
        endpointMethod,
        identifierOverride,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
        identifierOverride: string | undefined;
    }): APIV1Read.EndpointSnippetTemplates | undefined {
        let snippetsForEndpoint;
        if (identifierOverride != null) {
            snippetsForEndpoint = this.snippetTemplatesByEndpointId[identifierOverride];
        }

        if (identifierOverride == null || this.snippetTemplatesByEndpointId[identifierOverride] == null) {
            snippetsForEndpoint = this.snippetTemplatesByEndpoint[endpointPath]?.[endpointMethod];
        }
        return snippetsForEndpoint;
    }
}
