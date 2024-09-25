import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { getMarkdownSectionTree, getMarkdownSections } from "../../services/algolia/AlgoliaSearchRecordGenerator";

describe("algolia utils", () => {
    it("should extract headers into a tree from markdown content 1", () => {
        expect(
            getMarkdownSections(
                getMarkdownSectionTree(
                    `---
title: Overview
subtitle: A comprehensive reference for integrating with Chariot API endpoints
---
The Chariot API is organized around REST. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

<Info title="Issues, Ideas or Feedback">
If you feel like something is missing from our API docs, feel free to create an Issue on our [OpenAPI GitHub repo](https://github.com/chariot-giving/chariot-openapi).
</Info>

## API protocols and headers

The Chariot API uses standard HTTP response codes to indicate status and errors. All responses come in standard JSON. The Chariot API is served over HTTPS TLS v1.2+ to ensure data privacy; HTTP and HTTPS with TLS versions below 1.2 are not supported. All requests with a payload must include a Content-Type of application/JSON and the body must be valid JSON.

Every Chariot API response includes a request_id as the \`X-Request-Id\` header. The request_id is included whether the API request succeeded or failed. For faster support, include the request_id when contacting support regarding a specific API call.

## API host 

\`\`\`js Server.js
https://sandboxapi.givechariot.com (Sandbox)
https://api.givechariot.com (Production)
\`\`\`

Chariot has two environments: Sandbox and Production. The Sandbox environment supports only test data. All activity in the Production environment is real. When you’re getting ready to launch into production, please let us know by emailing [support@givechariot.com](support@givechariot.com) to get your production credentials.
`,
                    "Overview",
                ),
                [],
                FdrAPI.IndexSegmentId("testindex"),
                FernNavigation.V1.Slug("v1/someslug"),
            ).map((record) => {
                return {
                    ...record,
                    objectID: undefined,
                };
            }),
        ).toEqual([
            {
                breadcrumbs: [
                    {
                        slug: "v1/someslug",
                        title: "Overview",
                    },
                ],
                content:
                    "The Chariot API is organized around REST. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.\n\n\nIf you feel like something is missing from our API docs, feel free to create an Issue on our [OpenAPI GitHub repo](https://github.com/chariot-giving/chariot-openapi).\n",
                indexSegmentId: "testindex",
                objectID: undefined,
                slug: "v1/someslug",
                title: "Overview",
                type: "markdown-section-v1",
            },
            {
                breadcrumbs: [
                    {
                        slug: "v1/someslug",
                        title: "Overview",
                    },
                    {
                        slug: "v1/someslug#API%20protocols%20and%20headers",
                        title: "API protocols and headers",
                    },
                ],
                content:
                    "The Chariot API uses standard HTTP response codes to indicate status and errors. All responses come in standard JSON. The Chariot API is served over HTTPS TLS v1.2+ to ensure data privacy; HTTP and HTTPS with TLS versions below 1.2 are not supported. All requests with a payload must include a Content-Type of application/JSON and the body must be valid JSON.\n\nEvery Chariot API response includes a request_id as the `X-Request-Id` header. The request_id is included whether the API request succeeded or failed. For faster support, include the request_id when contacting support regarding a specific API call.",
                indexSegmentId: "testindex",
                objectID: undefined,
                slug: "v1/someslug#API%20protocols%20and%20headers",
                title: "API protocols and headers",
                type: "markdown-section-v1",
            },
            {
                breadcrumbs: [
                    {
                        slug: "v1/someslug",
                        title: "Overview",
                    },
                    {
                        slug: "v1/someslug#API%20host",
                        title: "API host",
                    },
                ],
                content:
                    "```js Server.js\nhttps://sandboxapi.givechariot.com (Sandbox)\nhttps://api.givechariot.com (Production)\n```\n\nChariot has two environments: Sandbox and Production. The Sandbox environment supports only test data. All activity in the Production environment is real. When you’re getting ready to launch into production, please let us know by emailing [support@givechariot.com](support@givechariot.com) to get your production credentials.",
                indexSegmentId: "testindex",
                objectID: undefined,
                slug: "v1/someslug#API%20host",
                title: "API host",
                type: "markdown-section-v1",
            },
        ]);
    });

    it("should extract headers into a tree from markdown content", () => {
        expect(
            getMarkdownSectionTree(
                `
            # A
            this is line A
            ## B
            this is line b
            \`\`\`
            ## somecrap
            fasdfafafdadf
            \`\`\`
            ### C
            this is line c
            
            this is line c.2
            
            ### D
            this is line d
            ## E
            this is line e
            ### F
            this is line f
            this is line f.2
            ## G
            this is line g
            `,
                "something",
            ),
        ).toEqual({
            level: 0,
            heading: "something",
            content: "\n",
            children: [
                {
                    level: 1,
                    heading: "A",
                    content: "this is line A\n",
                    children: [
                        {
                            level: 2,
                            heading: "B",
                            content: "this is line b\n```\n## somecrap\nfasdfafafdadf\n```\n",
                            children: [
                                {
                                    level: 3,
                                    heading: "C",
                                    content: "this is line c\n\nthis is line c.2\n\n",
                                    children: [],
                                },
                                {
                                    level: 3,
                                    heading: "D",
                                    content: "this is line d\n",
                                    children: [],
                                },
                            ],
                        },
                        {
                            level: 2,
                            heading: "E",
                            content: "this is line e\n",
                            children: [
                                {
                                    level: 3,
                                    heading: "F",
                                    content: "this is line f\nthis is line f.2\n",
                                    children: [],
                                },
                            ],
                        },
                        {
                            level: 2,
                            heading: "G",
                            content: "this is line g\n\n",
                            children: [],
                        },
                    ],
                },
            ],
        });
    });

    it("should flatten the tree", () => {
        expect(
            getMarkdownSections(
                {
                    level: 0,
                    heading: "",
                    content: "\n",
                    children: [
                        {
                            level: 1,
                            heading: "A",
                            content: "this is line A\n",
                            children: [
                                {
                                    level: 2,
                                    heading: "B",
                                    content: "this is line b\n```\n## somecrap\nfasdfafafdadf\n```\n",
                                    children: [
                                        {
                                            level: 3,
                                            heading: "C",
                                            content: "this is line c\n\nthis is line c.2\n\n",
                                            children: [],
                                        },
                                        {
                                            level: 3,
                                            heading: "D",
                                            content: "this is line d\n",
                                            children: [],
                                        },
                                    ],
                                },
                                {
                                    level: 2,
                                    heading: "E",
                                    content: "this is line e\n",
                                    children: [
                                        {
                                            level: 3,
                                            heading: "F",
                                            content: "this is line f\nthis is line f.2\n",
                                            children: [],
                                        },
                                    ],
                                },
                                {
                                    level: 2,
                                    heading: "G",
                                    content: "this is line g\n\n",
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                [],
                FdrAPI.IndexSegmentId("testindex"),
                FernNavigation.V1.Slug("v1/someslug"),
            ).map((record) => {
                return {
                    ...record,
                    objectID: undefined,
                };
            }),
        ).toEqual([
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "A",
                content: "this is line A",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#A",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "B",
                content: "this is line b\n```\n## somecrap\nfasdfafafdadf\n```",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "v1/someslug#B",
                        title: "B",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#B",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "C",
                content: "this is line c\n\nthis is line c.2",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "v1/someslug#B",
                        title: "B",
                    },
                    {
                        slug: "v1/someslug#C",
                        title: "C",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#C",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "D",
                content: "this is line d",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "v1/someslug#B",
                        title: "B",
                    },
                    {
                        slug: "v1/someslug#D",
                        title: "D",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#D",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "E",
                content: "this is line e",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "v1/someslug#E",
                        title: "E",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#E",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "F",
                content: "this is line f\nthis is line f.2",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "v1/someslug#E",
                        title: "E",
                    },
                    {
                        slug: "v1/someslug#F",
                        title: "F",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#F",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "G",
                content: "this is line g",
                breadcrumbs: [
                    {
                        slug: "v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "v1/someslug#G",
                        title: "G",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "v1/someslug#G",
            },
        ]);
    });
});
