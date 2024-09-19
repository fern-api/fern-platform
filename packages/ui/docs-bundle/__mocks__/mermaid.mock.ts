import { FdrAPI } from "@fern-api/fdr-sdk";

const mermaidMarkdown = `
\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\`
`;

export const mermaid: FdrAPI.docs.v2.read.LoadDocsForUrlResponse = {
    baseUrl: {
        domain: "mermaid-example.docs.buildwithfern.com",
    },
    definition: {
        pages: {
            "landing.mdx": {
                markdown: `# Welcome to Mermaid Example\n\n${mermaidMarkdown}`,
            },
        },
        apis: {},
        files: {},
        filesV2: {},
        config: {
            navigation: {
                landingPage: {
                    id: "landing.mdx",
                    title: "Landing",
                    urlSlug: "landing",
                },
                items: [],
            },
        },
        search: { type: "legacyMultiAlgoliaIndex" },
    },
    lightModeEnabled: false,
};
