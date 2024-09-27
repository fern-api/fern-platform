import { SnippetTemplateResolver } from "../../SnippetTemplateResolver";
import { CHAT_COMPLETION_SNIPPET, CHAT_COMPLETION_SNIPPET_WITH_LEGACY_CLIENT_INSTANTIATION } from "../cohere";

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
                    prompt_truncation: "OFF",
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
                pathParameters: undefined,
                queryParameters: undefined,
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
            payload: {
                headers: undefined,
                pathParameters: undefined,
                queryParameters: undefined,
                requestBody: undefined,
                auth: undefined,
            },
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        expect(customSnippet.client).toMatchSnapshot();
    });

    it("Test Chat Completion snippet with deeply nested iterables", async () => {
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
                    prompt_truncation: "OFF",
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
                    messages: [
                        {
                            tool_calls: [
                                {
                                    id: "qqw",
                                },
                            ],
                        },
                    ],
                },
                pathParameters: undefined,
                queryParameters: undefined,
            },
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET_WITH_LEGACY_CLIENT_INSTANTIATION,
        });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "typescript") {
            throw new Error("Expected snippet to be typescript");
        }

        expect(customSnippet.client).toMatchSnapshot();
    });
});
