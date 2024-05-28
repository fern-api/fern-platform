import { ResolvedEndpointDefinition } from "../../resolver/types";
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
        key,
        valueShape: {
            type: "primitive" as const,
            value: { type: "string" as const },
            description: undefined,
            availability: undefined,
        },
        hidden: false,
        description: undefined,
        availability: undefined,
    };
}

describe("getAllMatchablePathsForEndpoint", () => {
    it("should return all permutations for an endpoint", () => {
        const endpoint: Pick<ResolvedEndpointDefinition, "path" | "environments"> = {
            path: [literal("api"), pathParameter("id")],
            environments: [{ id: "1", baseUrl: "https://api.example.com" }],
        };
        const result = getMatchablePermutationsForEndpoint(endpoint);
        expect(result).toEqual(
            new Set(["/api/:id", "/api/{id}", "https://api.example.com/api/:id", "https://api.example.com/api/{id}"]),
        );
    });

    it("should return all permutations for an endpoint with a base path", () => {
        const endpoint: Pick<ResolvedEndpointDefinition, "path" | "environments"> = {
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
        const endpoint: Pick<ResolvedEndpointDefinition, "path" | "environments"> = {
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
