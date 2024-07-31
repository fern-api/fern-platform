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
            },
            endpointSnippetTemplate: UNIONS_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

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
            },
            endpointSnippetTemplate: UNIONS_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

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
            },
            endpointSnippetTemplate: UNIONS_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

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
            },
            endpointSnippetTemplate: UNIONS_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting(IMDB_API_DEFINITION);

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        expect(customSnippet.client).toMatchSnapshot();
    });
});
