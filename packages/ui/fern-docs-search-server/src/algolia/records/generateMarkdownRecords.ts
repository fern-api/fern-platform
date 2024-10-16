import { Algolia, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { MarkdownSectionRoot, getFrontmatter, splitMarkdownIntoSections } from "@fern-ui/fern-docs-mdx";

interface GenerateMarkdownRecordsOptions {
    indexSegmentId: Algolia.IndexSegmentId;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    node: FernNavigation.NavigationNodeWithMarkdown;
    version: Algolia.AlgoliaRecordVersionV3 | undefined;
    markdown: string;
}

export function generateMarkdownRecords({
    indexSegmentId,
    breadcrumb,
    node,
    version,
    markdown,
}: GenerateMarkdownRecordsOptions): Algolia.AlgoliaRecord.PageV4[] {
    const { data, content } = getFrontmatter(markdown);

    /**
     * If the title is not set in the frontmatter, use the title from the sidebar.
     */
    // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
    const title = data.title ?? node.title;

    const sections = [...splitMarkdownIntoSections(content)];

    const slug = FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug);

    // meta descriptions will be pre-pended to the root node, so we need to collect them here:
    const metaDescriptions = [data.description, data.subtitle ?? data.excerpt, data["og:description"]];

    const rootBreadcrumbs = breadcrumb.map((breadcrumb) => ({
        title: breadcrumb.title,
        slug: breadcrumb.pointsTo ?? "",
    }));

    // the root content can be missing if there is a subheading that immediately after the top of the page.
    let rootContent: string | undefined;
    if (sections[0]?.type === "root") {
        const rootSection = sections.shift() as MarkdownSectionRoot;
        rootContent = rootSection.content;
    }

    // collect all meta descriptions along with the root content, all of which can be used for string matching
    rootContent = [...metaDescriptions, rootContent]
        .filter(isNonNullish)
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .join("\n\n");

    const records: Algolia.AlgoliaRecord.PageV4[] = [];

    // we should still insert this record even if there's no content, because
    // the title of the record can still be matched
    records.push({
        type: "page-v4",
        title,
        slug,
        description: rootContent.length > 0 ? rootContent : undefined,
        breadcrumbs: rootBreadcrumbs,
        version,
        indexSegmentId,
    });

    sections.forEach((section, i) => {
        if (section.type === "root") {
            // the root section should have been shifted off this array earlier
            throw new Error(`Invariant: unexpected root section detected at index=${i + 1}`);
        }

        const { heading, content, parents } = section;

        const breadcrumbs = [
            ...rootBreadcrumbs,
            ...parents.map((parent) => ({
                title: parent.title,
                slug: FernNavigation.V1.Slug(`${slug}#${parent.anchor}`),
            })),
        ];

        // Note: unlike the root content, it's less important if subheadings are not indexed if there's no content inside
        // which should already been filtered out by splitMarkdownIntoSections()
        // TODO: we should probably separate this out into another record-type specifically for subheadings.
        const record: Algolia.AlgoliaRecord.PageV4 = {
            type: "page-v4",
            title: heading.title,
            slug: FernNavigation.V1.Slug(`${slug}#${heading.anchor}`),
            description: content,
            breadcrumbs,
            version,
            indexSegmentId,
        };

        records.push(record);
    });

    return records;
}
