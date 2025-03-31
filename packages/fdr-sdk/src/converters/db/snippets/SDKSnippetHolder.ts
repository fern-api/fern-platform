import { APIV1Read, APIV1Write, FdrAPI } from "../../../client";

export interface SnippetsConfigWithSdkId {
  typescriptSdk?: APIV1Write.TypescriptPackage & { sdkId: string };
  pythonSdk?: APIV1Write.PythonPackage & { sdkId: string };
  goSdk?: APIV1Write.GoModule & { sdkId: string };
  javaSdk?: APIV1Write.JavaCoordinate & { sdkId: string };
  rubySdk?: APIV1Write.RubyGem & { sdkId: string };
  csharpSdk?: APIV1Write.NugetPackage & { sdkId: string };
}

export interface SdkSnippetHolderArgs {
  // Legacy format for snippets leveraging path and method (which is not unique enough for some cases)
  snippetsBySdkId: Record<
    string,
    Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod>
  >;
  // If these are present for the SDK ID, use these, otherwise use snippetsBySdkId
  snippetsBySdkIdAndEndpointId: Record<
    string,
    Record<string, FdrAPI.Snippet[]>
  >;
  snippetsConfigWithSdkId: SnippetsConfigWithSdkId;
  snippetTemplatesByEndpoint: Record<
    FdrAPI.EndpointPathLiteral,
    Record<FdrAPI.HttpMethod, APIV1Read.EndpointSnippetTemplates>
  >;
  snippetTemplatesByEndpointId: Record<
    string,
    APIV1Read.EndpointSnippetTemplates
  >;
}

export class SDKSnippetHolder {
  private snippetsBySdkId: Record<
    string,
    Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod>
  >;
  private snippetsBySdkIdAndEndpointId: Record<
    string,
    Record<string, FdrAPI.Snippet[]>
  >;
  private snippetsConfigWithSdkId: SnippetsConfigWithSdkId;
  private snippetTemplatesByEndpoint: Record<
    FdrAPI.EndpointPathLiteral,
    Record<FdrAPI.HttpMethod, APIV1Read.EndpointSnippetTemplates>
  >;
  private snippetTemplatesByEndpointId: Record<
    string,
    APIV1Read.EndpointSnippetTemplates
  >;

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
    endpointId,
    exampleId,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
    exampleId: string | undefined;
  }): APIV1Read.PythonSnippet | undefined {
    if (this.snippetsConfigWithSdkId.pythonSdk == null) {
      return undefined;
    }
    return this.getCodeSnippetForEndpoint<APIV1Read.PythonSnippet>({
      endpointPath,
      endpointMethod,
      endpointId,
      exampleId,
      getSdk: (config) => config.pythonSdk,
      getSnippet: (snippet) => {
        return snippet.type === "python"
          ? { ...snippet, install: undefined }
          : undefined;
      },
    });
  }

  public getTypeScriptCodeSnippetForEndpoint({
    endpointPath,
    endpointMethod,
    endpointId,
    exampleId,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
    exampleId: string | undefined;
  }): APIV1Read.TypescriptSnippet | undefined {
    if (this.snippetsConfigWithSdkId.typescriptSdk == null) {
      return undefined;
    }
    return this.getCodeSnippetForEndpoint<APIV1Read.TypescriptSnippet>({
      endpointPath,
      endpointMethod,
      endpointId,
      exampleId,
      getSdk: (config) => config.typescriptSdk,
      getSnippet: (snippet) => {
        return snippet.type === "typescript"
          ? { ...snippet, install: undefined }
          : undefined;
      },
    });
  }

  public getGoCodeSnippetForEndpoint({
    endpointPath,
    endpointMethod,
    endpointId,
    exampleId,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
    exampleId: string | undefined;
  }): APIV1Read.GoSnippet | undefined {
    if (this.snippetsConfigWithSdkId.goSdk == null) {
      return undefined;
    }
    return this.getCodeSnippetForEndpoint<APIV1Read.GoSnippet>({
      endpointPath,
      endpointMethod,
      endpointId,
      exampleId,
      getSdk: (config) => config.goSdk,
      getSnippet: (snippet) => {
        return snippet.type === "go"
          ? { ...snippet, install: undefined }
          : undefined;
      },
    });
  }

  public getRubyCodeSnippetForEndpoint({
    endpointPath,
    endpointMethod,
    endpointId,
    exampleId,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
    exampleId: string | undefined;
  }): APIV1Read.RubySnippet | undefined {
    if (this.snippetsConfigWithSdkId.rubySdk == null) {
      return undefined;
    }
    return this.getCodeSnippetForEndpoint<APIV1Read.RubySnippet>({
      endpointPath,
      endpointMethod,
      endpointId,
      exampleId,
      getSdk: (config) => config.rubySdk,
      getSnippet: (snippet) => {
        return snippet.type === "ruby"
          ? { ...snippet, install: undefined }
          : undefined;
      },
    });
  }

  public getCsharpCodeSnippetForEndpoint({
    endpointPath,
    endpointMethod,
    endpointId,
    exampleId,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
    exampleId: string | undefined;
  }): APIV1Read.CsharpSnippet | undefined {
    if (this.snippetsConfigWithSdkId.csharpSdk == null) {
      return undefined;
    }
    return this.getCodeSnippetForEndpoint<APIV1Read.CsharpSnippet>({
      endpointPath,
      endpointMethod,
      endpointId,
      exampleId,
      getSdk: (config) => config.csharpSdk,
      getSnippet: (snippet) => {
        return snippet.type === "csharp"
          ? { ...snippet, install: undefined }
          : undefined;
      },
    });
  }

  public getCodeSnippetForEndpoint<T>({
    endpointPath,
    endpointMethod,
    endpointId,
    exampleId,
    getSdk,
    getSnippet,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
    exampleId: string | undefined;
    getSdk: (config: SnippetsConfigWithSdkId) => { sdkId: string } | undefined;
    getSnippet: (snippet: FdrAPI.Snippet) => T | undefined;
  }): T | undefined {
    const sdk = getSdk(this.snippetsConfigWithSdkId);
    if (sdk == null) {
      return undefined;
    }

    const sdkId = sdk.sdkId;
    let snippetsForEndpoint: FdrAPI.Snippet[] = [];
    if (endpointId != null) {
      snippetsForEndpoint =
        this.snippetsBySdkIdAndEndpointId[sdkId]?.[endpointId] ?? [];
    }

    if (endpointId == null || snippetsForEndpoint.length === 0) {
      snippetsForEndpoint =
        this.snippetsBySdkId[sdkId]?.[endpointPath]?.[endpointMethod] ?? [];
    }

    let snippets = snippetsForEndpoint.filter((snippet) => {
      return exampleId != null && snippet.exampleIdentifier === exampleId;
    });
    // if no example match, just pick first snippet for backwards-compatibility reasons
    if (snippets.length === 0 && snippetsForEndpoint[0] != null) {
      snippets = [snippetsForEndpoint[0]];
    }

    if (snippets[0] != null) {
      return getSnippet(snippets[0]);
    }
    return undefined;
  }

  public getSnippetTemplateForEndpoint({
    endpointPath,
    endpointMethod,
    endpointId,
  }: {
    endpointPath: FdrAPI.EndpointPathLiteral;
    endpointMethod: FdrAPI.HttpMethod;
    endpointId: string | undefined;
  }): APIV1Read.EndpointSnippetTemplates | undefined {
    let snippetsForEndpoint;
    if (endpointId != null) {
      snippetsForEndpoint = this.snippetTemplatesByEndpointId[endpointId];
    }

    if (
      endpointId == null ||
      this.snippetTemplatesByEndpointId[endpointId] == null
    ) {
      snippetsForEndpoint =
        this.snippetTemplatesByEndpoint[endpointPath]?.[endpointMethod];
    }
    return snippetsForEndpoint;
  }
}
