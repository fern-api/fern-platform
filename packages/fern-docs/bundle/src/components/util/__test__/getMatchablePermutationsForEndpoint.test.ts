import {
  EndpointDefinition,
  EnvironmentId,
  PathPart,
  PropertyKey,
} from "@fern-api/fdr-sdk/api-definition";

import { getMatchablePermutationsForEndpoint } from "../processRequestSnippetComponents";

function literal(value: string): PathPart.Literal {
  return {
    type: "literal" as const,
    value,
  };
}
function pathParameter(key: string): PathPart.PathParameter {
  return {
    type: "pathParameter" as const,
    value: PropertyKey(key),
  };
}

describe("getAllMatchablePathsForEndpoint", () => {
  it("should return all permutations for an endpoint", () => {
    const endpoint: Pick<EndpointDefinition, "path" | "environments"> = {
      path: [literal("/api/"), pathParameter("id")],
      environments: [
        { id: EnvironmentId("1"), baseUrl: "https://api.example.com" },
      ],
    };
    const result = getMatchablePermutationsForEndpoint(endpoint);
    expect(result).toEqual(
      new Set([
        "/api/:id",
        "/api/{id}",
        "https://api.example.com/api/:id",
        "https://api.example.com/api/{id}",
      ])
    );
  });

  it("should return all permutations for an endpoint with a base path", () => {
    const endpoint: Pick<EndpointDefinition, "path" | "environments"> = {
      path: [literal("/api/"), pathParameter("id")],
      environments: [
        {
          id: EnvironmentId("1"),
          baseUrl: "https://api.example.com/v1",
        },
      ],
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
      ])
    );
  });

  // tests urljoin works
  it("should return all permutations for an endpoint with a base path 2", () => {
    const endpoint: Pick<EndpointDefinition, "path" | "environments"> = {
      path: [literal("/api/"), pathParameter("id")],
      environments: [
        {
          id: EnvironmentId("1"),
          baseUrl: "https://api.example.com/v1/",
        },
      ],
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
      ])
    );
  });
});
