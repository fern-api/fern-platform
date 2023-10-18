import { FdrAPI } from "../../api";

export class EndpointSnippetCollector {
    private snippetsByEndpoint: Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod> = {};

    public collect({
        endpointPath,
        endpointMethod,
        snippet,
    }: {
        endpointPath: string;
        endpointMethod: "POST" | "PUT" | "GET" | "PATCH" | "DELETE";
        snippet: FdrAPI.Snippet;
    }) {
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

    public get(): Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod> {
        return this.snippetsByEndpoint;
    }
}
