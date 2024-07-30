import { SnippetTemplateResolver } from "../../SnippetTemplateResolver";
import { CHAT_COMPLETION_SNIPPET } from "../cohere";

describe("Snippet Template Resolver", () => {
    it("Test Chat Completion snippet", async () => {
        const resolver = new SnippetTemplateResolver({
            payload: {
                auth: {
                    type: "bearer",
                    token: "BE_1234",
                },
                headers: [
                    {
                        name: "X-Client-Name",
                        value: "Cohere's Client",
                    },
                ],
                requestBody: {
                    message: "Hello world!",
                    chat_history: [
                        {
                            role: "USER",
                            message: "Hello",
                        },
                        {
                            role: "CHATBOT",
                            message: "Hi! How can I help you today?",
                        },
                    ],
                },
            },
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        expect(customSnippet.client).toMatchSnapshot();
    });

    it("Test empty payload", async () => {
        const resolver = new SnippetTemplateResolver({
            payload: {},
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        expect(customSnippet.client).toMatchSnapshot();
    });
});
