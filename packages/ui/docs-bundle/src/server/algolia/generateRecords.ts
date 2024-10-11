import { Algolia } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-ui/ui";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { parseMarkdownToTree } from "../markdown/parse";
import { getPosition } from "../markdown/position";

export function generateAlgoliaRecords(
    nodes: FernNavigation.RootNode,
    pages: Record<FernNavigation.PageId, string>,
    apiDefinitions: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>,
): Algolia.AlgoliaRecord[] {
    const collector = FernNavigation.NodeCollector.collect(nodes);

    const records: Algolia.AlgoliaRecord[] = [];

    // collector.getVersionNodes().forEach((node) => {

    collector.indexablePageSlugs
        .map((slug) => collector.slugMap.get(slug))
        .filter(isNonNullish)
        .forEach((node) => {
            if (FernNavigation.hasMarkdown(node)) {
                const pageId = FernNavigation.getPageId(node);

                if (pageId) {
                    const markdown = pages[pageId];
                    if (markdown) {
                        records.push(...parseMarkdownPage(node, markdown));
                    } else {
                        // eslint-disable-next-line no-console
                        console.error(`Page node ${node.slug} has page id ${pageId} but no markdown`);
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.error(`Page node ${node.slug} has no page id`);
                }
            }

            if (FernNavigation.isApiLeaf(node)) {
                const apiDefinition = apiDefinitions[node.apiDefinitionId];
                if (apiDefinition) {
                    records.push(generateApiDefinitionRecord(node, apiDefinition));
                } else {
                    // eslint-disable-next-line no-console
                    console.error(
                        `API leaf node ${node.slug} has api definition id ${node.apiDefinitionId} but no api definition`,
                    );
                }
            }
        });

    return records;
}

const slugger = new GithubSlugger();

function parseMarkdownPage(
    indexSegmentId: Algolia.IndexSegmentId,
    node: FernNavigation.NavigationNodeWithMarkdown,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    markdown: string,
): Algolia.AlgoliaRecord.PageV4[] {
    const { data, content } = getFrontmatter(markdown);
    const lines = content.split("\n");
    const tree = parseMarkdownToTree(content);
    const records: Algolia.AlgoliaRecord.PageV4[] = [];

    /**
     * If the title is not set in the frontmatter, use the title from the sidebar.
     */
    // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
    const title = data.title ?? node.title;

    // collect all headings in the document
    const headings: {
        depth: 1 | 2 | 3 | 4 | 5 | 6;
        title: string;
        anchor: string;
        start: number;
        length: number;
    }[] = [];

    slugger.reset();
    visit(tree, "heading", (heading) => {
        // headings.push(heading);

        if (!heading.position) {
            // eslint-disable-next-line no-console
            console.error("Expected heading to have position; Skipping...");
            return;
        }

        const title = toString(heading);
        const anchor = slugger.slug(title);
        const { start, length } = getPosition(lines, heading.position);
        headings.push({ depth: heading.depth, title, anchor, start, length });
    });

    // for each heading, extract the text that immediately follows it, but before the next heading
    // and add it to the records. If there is no next heading, use the rest of the document.
    // note: the content immediately before the first heading is also added to the records

    let heading = headings.shift();

    const breadcrumbStack: {
        // keep track of the depth of the current breadcrumb item, so we know when to stop popping
        depth: number;
        breadcrumb: Algolia.BreadcrumbsInfo;
    }[] = breadcrumb.map((breadcrumb) => ({
        depth: 0, // all the navigation-level breadcrumbs will have depth 0, whereas markdown headings will be 1-6.
        breadcrumb: {
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        },
    }));

    const slug = FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug);

    // meta descriptions will be pre-pended to the root node, so we need to collect them here:
    const metaDescriptions = [data.description, data.subtitle ?? data.excerpt, data["og:description"]];

    if (heading == null) {
        // TODO: truncate description
        const description = [...metaDescriptions, content]
            .filter(isNonNullish)
            .map((text) => text.trim())
            .filter((text) => text.length > 0)
            .join("\n\n");

        const breadcrumbs = breadcrumbStack.map(({ breadcrumb }) => breadcrumb);
        records.push({ type: "page-v4", title, slug, description, breadcrumbs, version, indexSegmentId });

        // no headings, so we're done
        return records;
    } else {
        const textBeforeFirstHeading = content.slice(0, heading.start).trim();

        // TODO: truncate description
        const description = [...metaDescriptions, textBeforeFirstHeading]
            .filter(isNonNullish)
            .map((text) => text.trim())
            .filter((text) => text.length > 0)
            .join("\n\n");

        const breadcrumbs = breadcrumbStack.map(({ breadcrumb }) => breadcrumb);
        records.push({ type: "page-v4", title, slug, description, breadcrumbs, version, indexSegmentId });
    }

    // add the first root node to the breadcrumb stack
    breadcrumbStack.push({ depth: 1, breadcrumb: { title, slug } });

    while (heading != null) {
        const nextHeading = headings.shift();

        // if the nextHeading is null, slice to the end of the document
        const textBeforeNextHeading = content.slice(heading.start + heading.length, nextHeading?.start).trim();

        // generate the record
        if (textBeforeNextHeading.length > 0) {
            const breadcrumbs = breadcrumbStack.map(({ breadcrumb }) => breadcrumb);
            records.push({
                type: "page-v4",
                title: heading.title,
                slug: FernNavigation.V1.Slug(`${slug}#${heading.anchor}`),
                // TODO: truncate description
                description: textBeforeNextHeading,
                breadcrumbs,
                version,
                indexSegmentId,
            });
        }

        // update the breadcrumb stack
        if (nextHeading != null) {
            // if the next heading is deeper than the current heading, push the current heading onto the stack
            if (nextHeading.depth > heading.depth) {
                breadcrumbStack.push({
                    depth: nextHeading.depth,
                    breadcrumb: { title: heading.title, slug: heading.anchor },
                });
            } else {
                // pop until we find the correct depth
                while (
                    breadcrumbStack.length > 0 &&
                    (breadcrumbStack[breadcrumbStack.length - 1]?.depth ?? 0) >= nextHeading.depth
                ) {
                    breadcrumbStack.pop();
                }
            }
        }

        heading = nextHeading;
    }

    return records;
}

// function generateApiDefinitionRecords(
//     node: FernNavigation.NavigationNodeApiLeaf,
//     apiDefinition: ApiDefinition.ApiDefinition,
// ): (
//     | Algolia.AlgoliaRecord.EndpointV4
//     | Algolia.AlgoliaRecord.WebsocketV4
//     | Algolia.AlgoliaRecord.WebhookV4
//     | Algolia.AlgoliaRecord.EndpointFieldV1
//     | Algolia.AlgoliaRecord.WebsocketFieldV1
//     | Algolia.AlgoliaRecord.WebhookFieldV1
// )[] {
//     switch (node.type) {
//         case "endpoint":
//             return generateEndpointRecords(node, apiDefinition);
//         case "webSocket":
//             return generateWebSocketRecords(node, apiDefinition);
//         case "webhook":
//             return generateWebhookRecords(node, apiDefinition);
//     }
// }

function generateEndpointRecords(
    node: FernNavigation.EndpointNode,
    apiDefinition: ApiDefinition.ApiDefinition,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    indexSegmentId: Algolia.IndexSegmentId,
): Algolia.AlgoliaRecord.EndpointV4[] {
    const endpoint = apiDefinition.endpoints[node.endpointId];

    if (endpoint == null) {
        // eslint-disable-next-line no-console
        console.error(`Endpoint node ${node.slug} has no endpoint ${node.endpointId}`);
        return [];
    }

    return [
        {
            type: "endpoint-v4",
            method: endpoint.method,
            endpointPath: endpoint.path,
            isResponseStream:
                endpoint.response?.body.type === "stream" || endpoint.response?.body.type === "streamingText",
            title: node.title,
            description: typeof endpoint.description === "string" ? endpoint.description : undefined,
            breadcrumbs: breadcrumb.map((breadcrumb) => ({
                title: breadcrumb.title,
                slug: breadcrumb.pointsTo ?? "",
            })),
            slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
            version,
            indexSegmentId,
        },
    ];
}
