import { APIV1Read, APIV1Write, FdrAPI } from "../../../client";

export interface SdkSnippetHolderArgs {
    snippetsBySdkId: Record<string, Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>>;
    packageToSdkId: Record<string, string>;
    snippetsConfiguration: APIV1Write.SnippetsConfig;
}

export class SDKSnippetHolder {
    private snippetsConfiguration: APIV1Write.SnippetsConfig;
    private snippetsBySdkId: Record<string, Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>>;
    private packageToSdkId: Record<string, string>;

    constructor({ snippetsBySdkId, packageToSdkId, snippetsConfiguration }: SdkSnippetHolderArgs) {
        this.snippetsBySdkId = snippetsBySdkId;
        this.packageToSdkId = packageToSdkId;
        this.snippetsConfiguration = snippetsConfiguration;
    }

    public getPythonCodeSnippetForEndpoint({
        endpointPath,
        endpointMethod,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
    }): APIV1Read.PythonSnippet | undefined {
        if (this.snippetsConfiguration.pythonSdk == null) {
            return undefined;
        }
        const sdkId = this.packageToSdkId[this.snippetsConfiguration.pythonSdk.package];
        if (sdkId == null) {
            return undefined;
        }
        const snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 1) {
            return undefined;
        }
        if (snippetsForEndpoint[0]?.type !== "python") {
            return undefined;
        }
        return {
            async_client: snippetsForEndpoint[0]?.async_client,
            sync_client: snippetsForEndpoint[0]?.sync_client,
        };
    }

    public getTypeScriptCodeSnippetForEndpoint({
        endpointPath,
        endpointMethod,
    }: {
        endpointPath: string;
        endpointMethod: FdrAPI.EndpointMethod;
    }): APIV1Read.TypescriptSnippet | undefined {
        if (this.snippetsConfiguration.typescriptSdk == null) {
            return undefined;
        }
        const sdkId = this.packageToSdkId[this.snippetsConfiguration.typescriptSdk.package];
        if (sdkId == null) {
            return undefined;
        }
        const snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 1) {
            return undefined;
        }
        if (snippetsForEndpoint[0]?.type !== "typescript") {
            return undefined;
        }
        return {
            client: snippetsForEndpoint[0]?.client,
        };
    }
}
