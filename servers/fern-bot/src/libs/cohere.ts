import { CohereClient } from "cohere-ai";

const DEFAULT_GITHUB_MESSAGE = "[Scheduled] Update API Spec";

async function coChat(prompt: string): Promise<string> {
  const co = new CohereClient();
  const response = await co.chat({ model: "command-r-plus", message: prompt });

  if (response.finishReason !== "COMPLETE") {
    return DEFAULT_GITHUB_MESSAGE;
  }

  return response.text;
}

export async function generateCommitMessage(
  diff: string,
  fallbackMessage: string
): Promise<string> {
  if (diff === "") {
    return DEFAULT_GITHUB_MESSAGE;
  }

  const prompt = `Given the following git diff, write a short and professional but descriptive commit message that strictly follows the Conventional Commits specification validated via regex r'^(feat|fix|docs|style|refactor|test|chore)(([w-]+))?: .+$.
    The commit message should be a summary of all the changes within the diff and should provide as much detail as possible to give context to the changes, while remaining short and concise. This is important, don't hallucinate this.

    \`\`\`
    ${diff}
    \`\`\`
    `;
  try {
    return await coChat(prompt);
  } catch (error) {
    console.error(
      `Call to Cohere failed generating commit message, with error: ${(error as Error).message}, using fallback message: ${fallbackMessage}`
    );

    return fallbackMessage;
  }
}

export async function generateChangelog(
  diff: string,
  fallbackMessage: string
): Promise<string> {
  if (diff === "") {
    return DEFAULT_GITHUB_MESSAGE;
  }

  const prompt = `You are an OpenAPI expert, your goal is to help me write a changelog for the following OpenAPI spec diff. The changelog should be concise, informative and user friendly. This is important, don't hallucinate this.
    Here is an example of what a changelog should look like:
        diff:
            \`\`\`
            diff --git a/fern/openapi/openapi.json b/fern/openapi/openapi.json
            index f2f381f..9bcfa41 100644
            --- a/fern/openapi/openapi.json
            +++ b/fern/openapi/openapi.json
            @@ -1,5 +1,9 @@
            {
            @@ -54,6 +54,136 @@
                }
            ],
            "paths": {
            +    "/stations": {
            +      "get": {
            +        "summary": "Get a list of train stations",
            +        "description": "Returns a list of all train stations in the system.",
            +        "operationId": "get-stations",
            +        "tags": [
            +          "Stations"
            +        ],
            +        "responses": {
            +          "200": {
            +            "description": "A list of train stations",
            +            "headers": {
            +              "RateLimit": {
            +                "$ref": "#/components/headers/RateLimit"
            +              }
            +            },
            +            "content": {
            +              "application/json": {
            +                "schema": {
            +                  "allOf": [
            +                    {
            +                      "$ref": "#/components/schemas/Wrapper-Collection"
            +                    },
            +                    {
            +                      "properties": {
            +                        "data": {
            +                          "type": "array",
            +                          "items": {
            +                            "$ref": "#/components/schemas/Station"
            +                          }
            +                        }
            +                      }
            +                    },
            +                    {
            +                      "properties": {
            +                        "links": {
            +                          "allOf": [
            +                            {
            +                              "$ref": "#/components/schemas/Links-Self"
            +                            },
            +                            {
            +                              "$ref": "#/components/schemas/Links-Pagination"
            +                            }
            +                          ]
            +                        }
            +                      }
            +                    }
            +                  ]
            +                },
            +                "example": {
            +                  "data": [
            +                    {
            +                      "id": "efdbb9d1-02c2-4bc3-afb7-6788d8782b1e",
            +                      "name": "Berlin Hauptbahnhof",
            +                      "address": "Invalidenstraße 10557 Berlin, Germany",
            +                      "country_code": "DE",
            +                      "timezone": "Europe/Berlin"
            +                    },
            +                    {
            +                      "id": "b2e783e1-c824-4d63-b37a-d8d698862f1d",
            +                      "name": "Paris Gare du Nord",
            +                      "address": "18 Rue de Dunkerque 75010 Paris, France",
            +                      "country_code": "FR",
            +                      "timezone": "Europe/Paris"
            +                    }
            +                  ],
            +                  "links": {
            +                    "self": "https://api.example.com/stations&page=2",
            +                    "next": "https://api.example.com/stations?page=3",
            +                    "prev": "https://api.example.com/stations?page=1"
            +                  }
            +                }
            +              },
            +              "application/xml": {
            +                "schema": {
            +                  "allOf": [
            +                    {
            +                      "$ref": "#/components/schemas/Wrapper-Collection"
            +                    },
            +                    {
            +                      "properties": {
            +                        "data": {
            +                          "type": "array",
            +                          "xml": {
            +                            "name": "stations",
            +                            "wrapped": true
            +                          },
            +                          "items": {
            +                            "$ref": "#/components/schemas/Station"
            +                          }
            +                        }
            +                      }
            +                    },
            +                    {
            +                      "properties": {
            +                        "links": {
            +                          "allOf": [
            +                            {
            +                              "$ref": "#/components/schemas/Links-Self"
            +                            },
            +                            {
            +                              "$ref": "#/components/schemas/Links-Pagination"
            +                            }
            +                          ]
            +                        }
            +                      }
            +                    }
            +                  ]
            +                }
            +              }
            +            }
            +          },
            +        }
            +      }
            +    },
                "/trips": {
                "get": {
                    "summary": "Get available train trips",
            @@ -914,6 +1044,39 @@
                    }
                    }
                },
            +      "Problem": {
            +        "xml": {
            +          "name": "problem",
            +          "namespace": "urn:ietf:rfc:7807"
            +        },
            +        "properties": {
            +          "type": {
            +            "type": "string",
            +            "description": "A URI reference that identifies the problem type",
            +            "example": "https://example.com/probs/out-of-credit"
            +          },
            +          "status": {
            +            "type": "integer",
            +            "description": "The HTTP status code",
            +            "example": 400
            +          }
            +        }
            +      },
                "Trip": {
                    "type": "object",
                    "xml": {
            @@ -1486,4 +1649,4 @@
                }
                }
            }
            -}
            +}
            \\ No newline at end of file
            \`\`\`
        Changelog:
            ## Summary
            A new endpoint \`/stations\` was added to the API to get a list of train stations, and a new object \`Problem\` was added as well.
            ### Added
            - Added a new endpoint \`/stations\` to get a list of train stations.
            - Added a new object \`Problem\` to the API.
            ### Removed
            - Nothing was removed.
            ### Changed
            - Nothing else was changed.

    Now write one for the following diff:
        \`\`\`
        ${diff}
        \`\`\`
    `;

  try {
    return await coChat(prompt);
  } catch (error) {
    console.error(
      `Call to Cohere failed writing the PR body, with error: ${(error as Error).message}, using fallback message: ${fallbackMessage}`
    );

    return fallbackMessage;
  }
}
