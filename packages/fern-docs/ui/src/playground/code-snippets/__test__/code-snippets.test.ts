import {
  EndpointContext,
  EndpointDefinition,
  EndpointId,
  EnvironmentId,
  PropertyKey,
} from "@fern-api/fdr-sdk/api-definition";
import {
  ApiDefinitionId,
  EndpointNode,
  NodeId,
  Slug,
} from "@fern-api/fdr-sdk/navigation";
import { PlaygroundEndpointRequestFormState } from "../../types";
import { CurlSnippetBuilder } from "../builders/curl";
import { PythonRequestSnippetBuilder } from "../builders/python";
import { TypescriptFetchSnippetBuilder } from "../builders/typescript";

describe("PlaygroundCodeSnippetBuilder", () => {
  const node: EndpointNode = {
    type: "endpoint",
    method: "POST",
    endpointId: EndpointId(""),
    isResponseStream: undefined,
    playground: undefined,
    title: "My endpoint",
    slug: Slug(""),
    canonicalSlug: undefined,
    icon: undefined,
    hidden: undefined,
    id: NodeId(""),
    apiDefinitionId: ApiDefinitionId(""),
    availability: undefined,
    authed: undefined,
    viewers: undefined,
    orphaned: undefined,
  };

  const endpoint: EndpointDefinition = {
    id: EndpointId(""),
    auth: undefined,
    availability: undefined,
    defaultEnvironment: EnvironmentId("Prod"),
    environments: [
      {
        id: EnvironmentId("Prod"),
        baseUrl: "https://example.com",
      },
    ],
    method: "POST",
    path: [
      { type: "literal", value: "/test/" },
      { value: PropertyKey("test"), type: "pathParameter" },
    ],
    pathParameters: [
      {
        key: PropertyKey("test"),
        valueShape: {
          type: "alias",
          value: {
            type: "primitive",
            value: {
              type: "string",
              regex: undefined,
              minLength: undefined,
              maxLength: undefined,
              default: undefined,
            },
          },
        },
        description: undefined,
        availability: undefined,
      },
    ],
    queryParameters: undefined,
    requestHeaders: undefined,
    request: undefined,
    response: undefined,
    errors: [],
    examples: [],
    snippetTemplates: undefined,
    description: undefined,
    responseHeaders: undefined,
    namespace: undefined,
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

  const context: EndpointContext = {
    node,
    endpoint,
    auth: undefined,
    types: {},
    globalHeaders: [],
  };

  it("should render curl", () => {
    expect(
      new CurlSnippetBuilder(context, formState, {}, undefined).build()
    ).toMatchSnapshot();
  });

  it("should render python", () => {
    expect(
      new PythonRequestSnippetBuilder(context, formState, {}, undefined).build()
    ).toMatchSnapshot();
  });

  it("should render typescript", () => {
    expect(
      new TypescriptFetchSnippetBuilder(
        context,
        formState,
        {},
        undefined
      ).build()
    ).toMatchSnapshot();
  });
});
