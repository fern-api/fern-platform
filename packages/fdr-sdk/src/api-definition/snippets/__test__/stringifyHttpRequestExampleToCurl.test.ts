import { APIV1Read, APIV1UI } from "../../../client";
import { toHttpRequest } from "../HttpRequest";
import { convertToCurl } from "../curl";

const MOCK_ENV = {
    id: "",
    baseUrl: "https://api.example.com",
};

const MOCK_ENDPOINT: APIV1Read.EndpointDefinition = {
    id: "",
    authed: true,
    availability: undefined,
    defaultEnvironment: MOCK_ENV.id,
    environments: [MOCK_ENV],
    method: "GET",
    path: {
        parts: [{ type: "literal", value: "/api" }],
        pathParameters: [],
    },
    queryParameters: [],
    headers: [],
    request: undefined,
    response: undefined,
    errors: [],
    examples: [],
    description: undefined,
    snippetTemplates: undefined,
    urlSlug: "/api",
};

const EMPTY_EXAMPLE = {
    pathParameters: {},
    queryParameters: {},
    headers: {},
    path: "/api",
    responseStatusCode: 0,
    codeExamples: {},
    codeSamples: [],
};

function stringifyMockEndpoint(auth: APIV1UI.ApiAuth): string {
    return convertToCurl(toHttpRequest(MOCK_ENDPOINT, EMPTY_EXAMPLE, undefined), {
        usesApplicationJsonInFormDataValue: false,
    });
}

describe("stringifyHttpRequestExampleToCurl", () => {
    it("should render header authorization", () => {
        expect(stringifyMockEndpoint({ type: "header", headerWireValue: "Authorization" })).toMatchSnapshot();
    });

    it("should render header authorization with prefix", () => {
        expect(
            stringifyMockEndpoint({ type: "header", headerWireValue: "Authorization", prefix: "Token" }),
        ).toMatchSnapshot();
    });

    it("should render header authorization with prefix and name override", () => {
        expect(
            stringifyMockEndpoint({
                type: "header",
                headerWireValue: "Authorization",
                nameOverride: "TOKEN",
                prefix: "Token",
            }),
        ).toMatchSnapshot();
    });

    it("should render bearer authorization", () => {
        expect(stringifyMockEndpoint({ type: "bearerAuth" })).toMatchSnapshot();
    });

    it("should render bearer authorization with custom token name", () => {
        expect(stringifyMockEndpoint({ type: "bearerAuth", tokenName: "MY_TOKEN" })).toMatchSnapshot();
    });

    it("should render basic authorization", () => {
        expect(stringifyMockEndpoint({ type: "basicAuth" })).toMatchSnapshot();
    });
});
