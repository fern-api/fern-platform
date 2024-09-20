import { getMarkdownSectionTree } from "../../services/algolia/AlgoliaSearchRecordGenerator";

describe("algolia utils", () => {
    it("should extract headers into a tree from markdown content", () => {
        expect(
            JSON.stringify(
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
            ),
        ).toBe(
            JSON.stringify([
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
            ]),
        );
    });
});
