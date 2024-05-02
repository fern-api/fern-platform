import { ResolvedEndpointDefinition } from "../../../resolver/types";
import { convertEndpointExampleToHttpRequestExample } from "../HttpRequestExample";
import { stringifyHttpRequestExampleToCurl } from "../stringifyHttpRequestExampleToCurl";

const MOCK_ENV = {
    id: "",
    baseUrl: "https://api.example.com",
};

const MOCK_ENDPOINT: ResolvedEndpointDefinition = {
    type: "endpoint",
    id: "",
    apiPackageId: "",
    slug: [],
    auth: undefined,
    availability: undefined,
    defaultEnvironment: MOCK_ENV,
    apiSectionId: "",
    environments: [MOCK_ENV],
    method: "GET",
    name: undefined,
    title: "",
    path: [{ type: "literal", value: "/api" }],
    pathParameters: [],
    queryParameters: [],
    headers: [],
    requestBody: [],
    responseBody: undefined,
    errors: [],
    examples: [],
    description: undefined,
    snippetTemplates: undefined,
};

const EMPTY_EXAMPLE = {
    pathParameters: {},
    queryParameters: {},
    headers: {},
    path: "",
    responseStatusCode: 0,
    codeExamples: {},
    codeSamples: [],
};

function stringifyMockEndpoint(overrides: Partial<ResolvedEndpointDefinition> = {}): string {
    return stringifyHttpRequestExampleToCurl(
        convertEndpointExampleToHttpRequestExample({ ...MOCK_ENDPOINT, ...overrides }, EMPTY_EXAMPLE, undefined),
    );
}

describe("stringifyHttpRequestExampleToCurl", () => {
    it("should render header authorization", () => {
        expect(stringifyMockEndpoint({ auth: { type: "header", headerWireValue: "Authorization" } })).toMatchSnapshot();
    });

    it("should render header authorization with prefix", () => {
        expect(
            stringifyMockEndpoint({ auth: { type: "header", headerWireValue: "Authorization", prefix: "Token" } }),
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
        expect(stringifyMockEndpoint({ auth: { type: "bearerAuth" } })).toMatchSnapshot();
    });

    it("should render bearer authorization with custom token name", () => {
        expect(stringifyMockEndpoint({ auth: { type: "bearerAuth", tokenName: "MY_TOKEN" } })).toMatchSnapshot();
    });

    it("should render basic authorization", () => {
        expect(stringifyMockEndpoint({ auth: { type: "basicAuth" } })).toMatchSnapshot();
    });
});
