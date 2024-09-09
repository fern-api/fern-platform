import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ResolvedEndpointDefinition } from "../../../resolver/types";
import { PlaygroundEndpointRequestFormState } from "../../types";
import { CurlSnippetBuilder } from "../builders/curl";
import { PythonRequestSnippetBuilder } from "../builders/python";
import { TypescriptFetchSnippetBuilder } from "../builders/typescript";

describe("PlaygroundCodeSnippetBuilder", () => {
    const endpoint: ResolvedEndpointDefinition = {
        type: "endpoint",
        nodeId: FernNavigation.NodeId(""),
        breadcrumbs: [],
        id: "",
        apiDefinitionId: "",
        slug: FernNavigation.Slug(""),
        auth: undefined,
        availability: undefined,
        defaultEnvironment: {
            id: "Prod",
            baseUrl: "https://example.com",
        },
        environments: [],
        method: "POST",
        title: "My endpoint",
        path: [
            { type: "literal", value: "/test/" },
            {
                key: "test",
                type: "pathParameter",
                valueShape: {
                    type: "primitive",
                    value: { type: "string" },
                    description: undefined,
                    availability: undefined,
                },
                hidden: false,
                description: undefined,
                availability: undefined,
            },
        ],
        pathParameters: [
            {
                key: "test",
                valueShape: {
                    type: "primitive",
                    value: { type: "string" },
                    description: undefined,
                    availability: undefined,
                },
                hidden: false,
                description: undefined,
                availability: undefined,
            },
        ],
        queryParameters: [],
        headers: [],
        requestBody: undefined,
        responseBody: undefined,
        errors: [],
        examples: [],
        snippetTemplates: undefined,
        stream: undefined,
        description: undefined,
    };
    const formState: PlaygroundEndpointRequestFormState = {
        type: "endpoint",
        headers: {
            Accept: "application/json",
            Test: "test",
        },
        pathParameters: {
            test: "hello@example",
        },
        queryParameters: {},
        body: {
            type: "json",
            value: {
                test: "hello",
                deeply: {
                    nested: 1,
                },
            },
        },
    };

    it("should render curl", () => {
        expect(new CurlSnippetBuilder(endpoint, formState).build()).toMatchSnapshot();
    });

    it("should render python", () => {
        expect(new PythonRequestSnippetBuilder(endpoint, formState).build()).toMatchSnapshot();
    });

    it("should render typescript", () => {
        expect(new TypescriptFetchSnippetBuilder(endpoint, formState).build()).toMatchSnapshot();
    });
});
