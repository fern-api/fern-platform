import { Algolia, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish, truncateToBytes } from "@fern-api/ui-core-utils";
import { MarkdownSectionRoot, getFrontmatter, splitMarkdownIntoSections, stripUtil } from "@fern-ui/fern-docs-mdx";
import { convertPageV4ToV3 } from "./v1-record-converter/convertRecords";

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
}: GenerateMarkdownRecordsOptions): (Algolia.AlgoliaRecord.PageV4 | Algolia.AlgoliaRecord.PageV3)[] {
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
        rootContent = stripUtil(rootSection.content);
    }

    // collect all meta descriptions along with the root content, all of which can be used for string matching
    rootContent = [...metaDescriptions, rootContent]
        .filter(isNonNullish)
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .join("\n\n");

    const records: (Algolia.AlgoliaRecord.PageV4 | Algolia.AlgoliaRecord.PageV3)[] = [];

    const rootRecord: Algolia.AlgoliaRecord.PageV4 = {
        type: "page-v4",
        title,
        slug,
        description: rootContent.length > 0 ? truncateToBytes(rootContent, 50 * 1000) : undefined,
        breadcrumbs: rootBreadcrumbs,
        version,
        indexSegmentId,
    };
    // we should still insert this record even if there's no content, because
    // the title of the record can still be matched
    records.push(rootRecord, convertPageV4ToV3(rootRecord, stripUtil(content)));

    sections.forEach((section, i) => {
        if (section.type === "root") {
            // the root section should have been shifted off this array earlier
            throw new Error(`Invariant: unexpected root section detected at index=${i + 1}`);
        }

        const { heading, content, parents } = section;
        const strippedContent = stripUtil(content);

        const breadcrumbs = [
            ...rootBreadcrumbs,
            ...parents.map((parent) => ({
                title: parent.title,
                slug: FernNavigation.V1.Slug(`${slug}#${parent.id}`),
            })),
        ];

        // Note: unlike the root content, it's less important if subheadings are not indexed if there's no content inside
        // which should already been filtered out by splitMarkdownIntoSections()
        // TODO: we should probably separate this out into another record-type specifically for subheadings.
        const record: Algolia.AlgoliaRecord.PageV4 = {
            type: "page-v4",
            title: heading.title,
            slug: FernNavigation.V1.Slug(`${slug}#${heading.id}`),
            description: strippedContent.length > 0 ? truncateToBytes(strippedContent, 50 * 1000) : undefined,
            breadcrumbs,
            version,
            indexSegmentId,
        };

        records.push(record, convertPageV4ToV3(record, strippedContent));
    });

    return records;
}
