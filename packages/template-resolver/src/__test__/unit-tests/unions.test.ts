import { SnippetTemplateResolver } from "../../SnippetTemplateResolver";
import { UNIONS_SNIPPET } from "../union";
import { IMDB_API_DEFINITION } from "./assets/imdbApiDefinition";

describe("Snippet Template Resolver", () => {
  it("Test Unions String", async () => {
    const resolver = new SnippetTemplateResolver({
      payload: {
        requestBody: {
          title: "Jaws",
          rating: 5.0,
          review: "Jaws was a great movie!",
        },
        headers: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        auth: undefined,
      },
      endpointSnippetTemplate: UNIONS_SNIPPET,
    });
    const customSnippet =
      await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

    if (customSnippet.type !== "typescript") {
      throw new Error("Expected snippet to be typescript");
    }

    expect(customSnippet.client).toMatchSnapshot();
  });

  it("Test Unions Number", async () => {
    const resolver = new SnippetTemplateResolver({
      payload: {
        requestBody: {
          title: "Jaws",
          rating: 5.0,
          review: 100000,
        },
        headers: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        auth: undefined,
      },
      endpointSnippetTemplate: UNIONS_SNIPPET,
    });
    const customSnippet =
      await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

    if (customSnippet.type !== "typescript") {
      throw new Error("Expected snippet to be typescript");
    }

    expect(customSnippet.client).toMatchSnapshot();
  });

  it("Test Unions Object", async () => {
    const resolver = new SnippetTemplateResolver({
      payload: {
        requestBody: {
          title: "Jaws",
          rating: 5.0,
          review: {
            summary: "Jaws was a great movie!",
            notes: "I loved the shark!",
            stars: 5,
          },
        },
        headers: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        auth: undefined,
      },
      endpointSnippetTemplate: UNIONS_SNIPPET,
    });
    const customSnippet =
      await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

    if (customSnippet.type !== "typescript") {
      throw new Error("Expected snippet to be typescript");
    }

    expect(customSnippet.client).toMatchSnapshot();
  });

  it("Test Unions Similar Object", async () => {
    const resolver = new SnippetTemplateResolver({
      payload: {
        requestBody: {
          title: "Jaws",
          rating: 5.0,
          review: {
            reallyAngrySummary: "Jaws was a great movie!",
            notes: "I loved the shark!",
            stars: 5,
          },
        },
        headers: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        auth: undefined,
      },
      endpointSnippetTemplate: UNIONS_SNIPPET,
    });
    const customSnippet =
      await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

    if (customSnippet.type !== "typescript") {
      throw new Error("Expected snippet to be typescript");
    }

    expect(customSnippet.client).toMatchSnapshot();
  });

  it("Test Unions Object Missing Property", async () => {
    const resolver = new SnippetTemplateResolver({
      payload: {
        requestBody: {
          title: "Jaws",
          rating: 5.0,
          review: {
            summary: "Jaws was a great movie!",
            notes: "I loved the shark!",
          },
        },
        headers: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        auth: undefined,
      },
      endpointSnippetTemplate: UNIONS_SNIPPET,
    });
    const customSnippet =
      await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

    if (customSnippet.type !== "typescript") {
      throw new Error("Expected snippet to be typescript");
    }

    expect(customSnippet.client).toMatchSnapshot();
  });

  it("Test Unions Object Total Mismatch", async () => {
    const resolver = new SnippetTemplateResolver({
      payload: {
        requestBody: {
          title: "Jaws",
          rating: 5.0,
          review: {
            anotherName: "This shouldn't show up.",
            anotherNotherName: "This definitely shouldn't show up.",
          },
        },
        headers: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        auth: undefined,
      },
      endpointSnippetTemplate: UNIONS_SNIPPET,
    });
    const customSnippet =
      await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

    if (customSnippet.type !== "typescript") {
      throw new Error("Expected snippet to be typescript");
    }

    expect(customSnippet.client).toMatchSnapshot();
  });
});
