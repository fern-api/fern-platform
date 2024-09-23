import { FdrAPI } from "../../api";

export class EndpointSnippetCollector {
    private snippetsByEndpoint: Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod> = {};
    private snippetsByEndpointId: Record<string, FdrAPI.Snippet[]> = {};

    public collect({
        endpointPath,
        endpointMethod,
        snippet,
        identifierOverride,
    }: {
        endpointPath: string;
        endpointMethod: "POST" | "PUT" | "GET" | "PATCH" | "DELETE";
        snippet: FdrAPI.Snippet;
        identifierOverride: string | undefined;
    }) {
        if (identifierOverride != null) {
            if (this.snippetsByEndpointId[identifierOverride] == null) {
                this.snippetsByEndpointId[identifierOverride] = [];
            }
            this.snippetsByEndpointId[identifierOverride]?.push(snippet);
        }
        if (this.snippetsByEndpoint[endpointPath] == null) {
            this.snippetsByEndpoint[endpointPath] = {
                PUT: [],
                POST: [],
                GET: [],
                PATCH: [],
                DELETE: [],
            };
        }
        this.snippetsByEndpoint[endpointPath]?.[endpointMethod]?.push(snippet);
    }

    public get(): Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod> {
        return this.snippetsByEndpoint;
    }

    public getByIdentifierOverride(): Record<string, FdrAPI.Snippet[]> {
        return this.snippetsByEndpointId;
    }
}
