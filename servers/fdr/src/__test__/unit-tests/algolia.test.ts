import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { getMarkdownSectionTree, getMarkdownSections } from "../../services/algolia/AlgoliaSearchRecordGenerator";

describe("algolia utils", () => {
    it("should extract headers into a tree from markdown content", () => {
        expect(
            getMarkdownSectionTree(`
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
            `),
        ).toEqual({
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
                FernNavigation.Slug("v1/someslug"),
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
                content: "this is line A\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "B",
                content: "this is line b\n```\n## somecrap\nfasdfafafdadf\n```\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "/v1/someslug#B",
                        title: "B",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "C",
                content: "this is line c\n\nthis is line c.2\n\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "/v1/someslug#B",
                        title: "B",
                    },
                    {
                        slug: "/v1/someslug#C",
                        title: "C",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "D",
                content: "this is line d\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "/v1/someslug#B",
                        title: "B",
                    },
                    {
                        slug: "/v1/someslug#D",
                        title: "D",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "E",
                content: "this is line e\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "/v1/someslug#E",
                        title: "E",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "F",
                content: "this is line f\nthis is line f.2\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "/v1/someslug#E",
                        title: "E",
                    },
                    {
                        slug: "/v1/someslug#F",
                        title: "F",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
            {
                type: "markdown-section-v1",
                objectID: undefined,
                title: "G",
                content: "this is line g\n\n",
                breadcrumbs: [
                    {
                        slug: "/v1/someslug#A",
                        title: "A",
                    },
                    {
                        slug: "/v1/someslug#G",
                        title: "G",
                    },
                ],
                indexSegmentId: "testindex",
                slug: "/v1/someslug",
            },
        ]);
    });
});
