import { SnippetTemplateResolver } from "../../SnippetTemplateResolver";
import { CHAT_COMPLETION_SNIPPET } from "../cohere";

describe("Snippet Template Resolver", () => {
    it("Test Chat Completion snippet", () => {
        const resolver = new SnippetTemplateResolver({
            payload: {
                requestBody: {
                    message: "Hello world!",
                },
            },
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET,
        });
        const customSnippet = resolver.resolve();

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        console.log(customSnippet.client);

        expect(customSnippet.client).toMatchSnapshot();
    });
});
