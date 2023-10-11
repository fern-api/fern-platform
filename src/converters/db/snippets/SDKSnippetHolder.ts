import { FdrAPI, APIV1Write, APIV1Read } from "../../../api";

export interface SdkSnippetHolderArgs {
    snippetsBySdkId: Record<string, Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>>;
    sdkIdToPackage: Record<string, string>;
    snippetsConfiguration: APIV1Write.SnippetsConfig;
}

export class SDKSnippetHolder {
    private snippetsConfiguration: APIV1Write.SnippetsConfig;
    private snippetsBySdkId: Record<string, Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>>;
    private sdkIdToPackage: Record<string, string>;

    constructor({ snippetsBySdkId, sdkIdToPackage, snippetsConfiguration }: SdkSnippetHolderArgs) {
        this.snippetsBySdkId = snippetsBySdkId;
        this.sdkIdToPackage = sdkIdToPackage;
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
        const sdkId = this.sdkIdToPackage[this.snippetsConfiguration.pythonSdk.package];
        if (sdkId == null) {
            return undefined;
        }
        const snippetsForEndpoint = this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod];
        // if no snippets for this endpoint or multiple snippets just return undefined
        if (snippetsForEndpoint == null || snippetsForEndpoint.length > 0) {
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
}
