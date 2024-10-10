import { APIV1Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ResolvedEndpointDefinition } from "../../../resolver/types";
import { convertEndpointExampleToHttpRequestExample } from "../HttpRequestExample";
import { stringifyHttpRequestExampleToCurl } from "../stringifyHttpRequestExampleToCurl";

const MOCK_ENV = {
    id: FernNavigation.EnvironmentId(""),
    baseUrl: "https://api.example.com",
};

const MOCK_ENDPOINT: ResolvedEndpointDefinition = {
    type: "endpoint",
    breadcrumb: [],
    nodeId: FernNavigation.NodeId(""),
    id: FernNavigation.EndpointId(""),
    // apiPackageId: "",
    slug: FernNavigation.Slug(""),
    auth: undefined,
    availability: undefined,
    defaultEnvironment: MOCK_ENV,
    apiDefinitionId: FernNavigation.ApiDefinitionId(""),
    environments: [MOCK_ENV],
    method: "GET",
    title: "",
    path: [{ type: "literal", value: "/api" }],
    pathParameters: [],
    queryParameters: [],
    headers: [],
    requestBody: undefined,
    responseBody: undefined,
    errors: [],
    examples: [],
    description: undefined,
    snippetTemplates: undefined,
    stream: undefined,
};

const EMPTY_EXAMPLE: APIV1Read.ExampleEndpointCall = {
    pathParameters: {},
    queryParameters: {},
    headers: {},
    path: "/api",
    responseStatusCode: 0,
    codeExamples: {
        nodeAxios: undefined,
        pythonSdk: undefined,
        typescriptSdk: undefined,
        goSdk: undefined,
        rubySdk: undefined,
    },
    codeSamples: [],
    name: undefined,
    requestBody: undefined,
    requestBodyV3: undefined,
    responseBody: undefined,
    responseBodyV3: undefined,
    description: undefined,
};

function stringifyMockEndpoint(overrides: Partial<ResolvedEndpointDefinition> = {}): string {
    return stringifyHttpRequestExampleToCurl(
        convertEndpointExampleToHttpRequestExample({ ...MOCK_ENDPOINT, ...overrides }, EMPTY_EXAMPLE, undefined),
    );
}

describe("stringifyHttpRequestExampleToCurl", () => {
    it("should render header authorization", () => {
        expect(
            stringifyMockEndpoint({
                auth: { type: "header", headerWireValue: "Authorization", nameOverride: undefined, prefix: undefined },
            }),
        ).toMatchSnapshot();
    });

    it("should render header authorization with prefix", () => {
        expect(
            stringifyMockEndpoint({
                auth: { type: "header", headerWireValue: "Authorization", prefix: "Token", nameOverride: undefined },
            }),
        ).toMatchSnapshot();
    });

    it("should render header authorization with prefix and name override", () => {
        expect(
            stringifyMockEndpoint({
                auth: { type: "header", headerWireValue: "Authorization", nameOverride: "TOKEN", prefix: "Token" },
            }),
        ).toMatchSnapshot();
    });

    it("should render bearer authorization", () => {
        expect(stringifyMockEndpoint({ auth: { type: "bearerAuth", tokenName: undefined } })).toMatchSnapshot();
    });

    it("should render bearer authorization with custom token name", () => {
        expect(stringifyMockEndpoint({ auth: { type: "bearerAuth", tokenName: "MY_TOKEN" } })).toMatchSnapshot();
    });

    it("should render basic authorization", () => {
        expect(
            stringifyMockEndpoint({ auth: { type: "basicAuth", usernameName: undefined, passwordName: undefined } }),
        ).toMatchSnapshot();
    });
});
