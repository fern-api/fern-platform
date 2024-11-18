import { isNonNullish } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-ui/fern-docs-mdx";

export function convertToLlmTxtMarkdown(markdown: string, nodeTitle: string): string {
    const { title, description, content } = getLlmTxtMetadata(markdown, nodeTitle);
    // TODO: add link-backs to the source of the content
    // TODO: parse the markdown content and delete any unnecessary content

    return [`# ${title}`, description != null ? `> ${description}` : undefined, content]
        .filter(isNonNullish)
        .join("\n\n");
}

interface LlmTxtMetadata {
    title: string;
    description: string | undefined;
    content: string;
}

export function getLlmTxtMetadata(markdown: string, nodeTitle: string): LlmTxtMetadata {
    const { data: frontmatter, content } = getFrontmatter(markdown);
    return {
        // TODO: parse the first h1 as the title
        title: frontmatter.title ?? nodeTitle,
        /**
         * Note: the description field in the frontmatter is expected to be the most descriptive
         * which is useful for LLM context. However, it's not always available, so we fall back
         * to other fields. But, effectively only one is selected to avoid redundancy.
         */
        description:
            frontmatter.description ??
            frontmatter["og:description"] ??
            frontmatter.subtitle ??
            frontmatter.headline ??
            frontmatter.excerpt,
        content,
    };
}
