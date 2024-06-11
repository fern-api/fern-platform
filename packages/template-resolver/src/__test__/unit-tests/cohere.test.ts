import { SnippetTemplateResolver } from "../../SnippetTemplateResolver";
import { CHAT_COMPLETION_SNIPPET } from "../cohere";

describe("Snippet Template Resolver", () => {
    it("Test Chat Completion snippet", () => {
        const resolver = new SnippetTemplateResolver({
            payload: {
                requestBody: {
                    message: "Hello world!",
                    chat_history: [
                        { role: "USER", message: "Who discovered gravity?" },
                        {
                            role: "CHATBOT",
                            message: "The man who is widely credited with discovering gravity is Sir Isaac Newton",
                        },
                    ],
                },
            },
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET,
        });
        const customSnippet = resolver.resolve();

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        expect(customSnippet.client).toMatchSnapshot();
    });
});
