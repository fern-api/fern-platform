import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";

export const UNIONS_SNIPPET: FernRegistry.EndpointSnippetTemplate = {
  sdk: {
    type: "typescript",
    package: "unions",
    version: "7.10.3",
  },
  endpointId: {
    path: FernRegistry.EndpointPathLiteral("/"),
    method: "POST",
    identifierOverride: "endpoint_.create_movie",
  },
  snippetTemplate: {
    type: "v1",
    functionInvocation: {
      type: "generic",
      imports: [],
      templateString: "await api.createMovie(\n\t$FERN_INPUT\n)",
      isOptional: false,
      inputDelimiter: ",\n\t",
      templateInputs: [
        {
          type: "template",
          value: {
            type: "generic",
            imports: [],
            templateString: "{\n\t\t$FERN_INPUT\n\t}",
            isOptional: true,
            inputDelimiter: ",\n\t\t",
            templateInputs: [
              {
                type: "template",
                value: {
                  type: "union_v2",
                  imports: [],
                  templateString: "review: $FERN_INPUT",
                  isOptional: true,
                  templateInput: {
                    location: "BODY",
                    path: "review",
                  },
                  members: [
                    {
                      type: {
                        type: "primitive",
                        value: {
                          type: "string",
                          format: undefined,
                          regex: undefined,
                          minLength: undefined,
                          maxLength: undefined,
                          default: undefined,
                        },
                      },
                      template: {
                        type: "generic",
                        imports: [],
                        templateString: "$FERN_INPUT",
                        isOptional: true,
                        templateInputs: [
                          {
                            type: "payload",
                            location: "RELATIVE",
                            path: undefined,
                          },
                        ],
                        inputDelimiter: undefined,
                      },
                    },
                    {
                      type: {
                        type: "primitive",
                        value: {
                          type: "double",
                          minimum: undefined,
                          maximum: undefined,
                          default: undefined,
                        },
                      },
                      template: {
                        type: "generic",
                        imports: [],
                        templateString: "$FERN_INPUT",
                        isOptional: true,
                        templateInputs: [
                          {
                            type: "payload",
                            location: "RELATIVE",
                            path: undefined,
                          },
                        ],
                        inputDelimiter: undefined,
                      },
                    },
                    {
                      type: {
                        type: "id",
                        value: FernRegistry.TypeId(
                          "type_imdb:DetailedMovieReview"
                        ),
                        default: undefined,
                      },
                      template: {
                        type: "generic",
                        imports: [],
                        templateString: "{ $FERN_INPUT }",
                        isOptional: true,
                        templateInputs: [
                          {
                            type: "template",
                            value: {
                              type: "generic",
                              imports: [],
                              templateString: "yourSummary: $FERN_INPUT",
                              isOptional: true,
                              templateInputs: [
                                {
                                  type: "payload",
                                  location: "RELATIVE",
                                  path: "summary",
                                },
                              ],
                              inputDelimiter: undefined,
                            },
                          },
                          {
                            type: "template",
                            value: {
                              type: "generic",
                              imports: [],
                              templateString: "yourNotes: $FERN_INPUT",
                              isOptional: true,
                              templateInputs: [
                                {
                                  type: "payload",
                                  location: "RELATIVE",
                                  path: "notes",
                                },
                              ],
                              inputDelimiter: undefined,
                            },
                          },
                          {
                            type: "template",
                            value: {
                              type: "generic",
                              imports: [],
                              templateString: "starRatings: $FERN_INPUT",
                              isOptional: true,
                              templateInputs: [
                                {
                                  type: "payload",
                                  location: "RELATIVE",
                                  path: "stars",
                                },
                              ],
                              inputDelimiter: undefined,
                            },
                          },
                        ],
                        inputDelimiter: undefined,
                      },
                    },
                    {
                      type: {
                        type: "id",
                        value: FernRegistry.TypeId(
                          "type_imdb:AgressiveMovieReview"
                        ),
                        default: undefined,
                      },
                      template: {
                        type: "generic",
                        imports: [],
                        templateString: "{ $FERN_INPUT }",
                        isOptional: true,
                        templateInputs: [
                          {
                            type: "template",
                            value: {
                              type: "generic",
                              imports: [],
                              templateString:
                                "yourReallyAngrySummary: $FERN_INPUT",
                              isOptional: true,
                              templateInputs: [
                                {
                                  type: "payload",
                                  location: "RELATIVE",
                                  path: "reallyAngrySummary",
                                },
                              ],
                              inputDelimiter: undefined,
                            },
                          },
                          {
                            type: "template",
                            value: {
                              type: "generic",
                              imports: [],
                              templateString: "yourAngryNotes: $FERN_INPUT",
                              isOptional: true,
                              templateInputs: [
                                {
                                  type: "payload",
                                  location: "RELATIVE",
                                  path: "notes",
                                },
                              ],
                              inputDelimiter: undefined,
                            },
                          },
                          {
                            type: "template",
                            value: {
                              type: "generic",
                              imports: [],
                              templateString: "angryStarRatings: $FERN_INPUT",
                              isOptional: true,
                              templateInputs: [
                                {
                                  type: "payload",
                                  location: "RELATIVE",
                                  path: "stars",
                                },
                              ],
                              inputDelimiter: undefined,
                            },
                          },
                        ],
                        inputDelimiter: undefined,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    clientInstantiation:
      'const cohere = new CohereClient({ token: "YOUR_TOKEN", clientName: "YOUR_CLIENT_NAME" });',
  },
  apiDefinitionId: undefined,
  additionalTemplates: undefined,
};
