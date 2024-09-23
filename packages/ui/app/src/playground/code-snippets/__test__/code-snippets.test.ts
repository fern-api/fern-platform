import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { PlaygroundEndpointRequestFormState } from "../../types";
import { CurlSnippetBuilder } from "../builders/curl";
import { PythonRequestSnippetBuilder } from "../builders/python";
import { TypescriptFetchSnippetBuilder } from "../builders/typescript";

describe("PlaygroundCodeSnippetBuilder", () => {
    const endpoint: ApiDefinition.EndpointDefinition = {
        nodeId: FernNavigation.NodeId(""),
        breadcrumbs: [],
        id: "",
        apiDefinitionId: "",
        slug: FernNavigation.Slug(""),
        availability: undefined,
        defaultEnvironment: "Prod",
        environments: [
            {
                id: "Prod",
                baseUrl: "https://example.com",
            },
        ],
        method: "POST",
        title: "My endpoint",
        path: [
            { type: "literal", value: "/test/" },
            {
                type: "pathParameter",
                value: "test",
            },
        ],
        pathParameters: [
            {
                key: "test",
                type: {
                    type: "primitive",
                    value: { type: "string" },
                },
            },
        ],
        queryParameters: [],
        requestHeaders: [],
        request: undefined,
        response: undefined,
        errors: [],
        examples: [],
        snippetTemplates: undefined,
        description: undefined,
        authed: true,
        responseHeaders: [],
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
