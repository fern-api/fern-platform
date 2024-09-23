import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { getMatchablePermutationsForEndpoint } from "../processRequestSnippetComponents";

function literal(value: string) {
    return {
        type: "literal" as const,
        value,
    };
}
function pathParameter(key: string) {
    return {
        type: "pathParameter" as const,
        value: key,
    };
}

describe("getAllMatchablePathsForEndpoint", () => {
    it("should return all permutations for an endpoint", () => {
        const endpoint: Pick<ApiDefinition.EndpointDefinition, "path" | "environments"> = {
            path: [literal("api"), pathParameter("id")],
            environments: [{ id: "1", baseUrl: "https://api.example.com" }],
        };
        const result = getMatchablePermutationsForEndpoint(endpoint);
        expect(result).toEqual(
            new Set(["/api/:id", "/api/{id}", "https://api.example.com/api/:id", "https://api.example.com/api/{id}"]),
        );
    });

    it("should return all permutations for an endpoint with a base path", () => {
        const endpoint: Pick<ApiDefinition.EndpointDefinition, "path" | "environments"> = {
            path: [literal("api"), pathParameter("id")],
            environments: [{ id: "1", baseUrl: "https://api.example.com/v1" }],
        };
        const result = getMatchablePermutationsForEndpoint(endpoint);
        expect(result).toEqual(
            new Set([
                "/api/:id",
                "/api/{id}",
                "/v1/api/:id",
                "/v1/api/{id}",
                "https://api.example.com/v1/api/:id",
                "https://api.example.com/v1/api/{id}",
            ]),
        );
    });

    // tests urljoin works
    it("should return all permutations for an endpoint with a base path 2", () => {
        const endpoint: Pick<ApiDefinition.EndpointDefinition, "path" | "environments"> = {
            path: [literal("/api/"), pathParameter("id")],
            environments: [{ id: "1", baseUrl: "https://api.example.com/v1/" }],
        };
        const result = getMatchablePermutationsForEndpoint(endpoint);
        expect(result).toEqual(
            new Set([
                "/api/:id",
                "/api/{id}",
                "/v1/api/:id",
                "/v1/api/{id}",
                "https://api.example.com/v1/api/:id",
                "https://api.example.com/v1/api/{id}",
            ]),
        );
    });
});
