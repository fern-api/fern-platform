import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode, SidebarNodeRaw } from "@fern-ui/fdr-utils";
import { FernSerializeMdxOptions, maybeSerializeMdxContent } from "../mdx/mdx";

export async function serializeSidebarNodeDescriptionMdx(
    node: SidebarNodeRaw,
    options?: FernSerializeMdxOptions,
): Promise<SidebarNode> {
    return visitDiscriminatedUnion(node, "type")._visit<Promise<SidebarNode>>({
        pageGroup: async (pageGroup): Promise<SidebarNode.PageGroup> => ({
            ...pageGroup,
            pages: await Promise.all(
                pageGroup.pages.map((page) =>
                    visitDiscriminatedUnion(page, "type")._visit<
                        Promise<SidebarNode.Section | SidebarNode.Page | SidebarNodeRaw.Link>
                    >({
                        section: async (section) => ({
                            ...section,
                            items: await Promise.all(
                                section.items.map((item) => serializeSidebarNodeDescriptionMdx(item, options)),
                            ),
                        }),
                        page: (value) => serializePageDescriptionMdx(value, options),
                        link: async (value) => value,
                        _other: (): never => {
                            throw new Error("Unexpected page type");
                        },
                    }),
                ),
            ),
        }),
        apiSection: (apiSection) => serializeApiSectionDescriptionMdx(apiSection, options),
        section: async (section) => ({
            ...section,
            items: await Promise.all(section.items.map((item) => serializeSidebarNodeDescriptionMdx(item, options))),
        }),
        _other: (node) => Promise.resolve(node as SidebarNode),
    });
}

async function serializeApiSectionDescriptionMdx(
    { flattenedApiDefinition, ...apiSection }: SidebarNodeRaw.ApiSection,
    options?: FernSerializeMdxOptions,
): Promise<SidebarNode.ApiSection> {
    return {
        ...apiSection,
        items: await Promise.all(
            apiSection.items.map((page) =>
                page.type === "page"
                    ? serializePageDescriptionMdx<SidebarNode.ApiPage>(page, options)
                    : (serializeApiSectionDescriptionMdx(page, options) as Promise<SidebarNode.SubpackageSection>),
            ),
        ),
        changelog: apiSection.changelog
            ? await serializePageDescriptionMdx<SidebarNode.ChangelogPage>(apiSection.changelog, options)
            : undefined,
        summaryPage: apiSection.summaryPage
            ? await serializePageDescriptionMdx<SidebarNode.ApiSummaryPage>(apiSection.summaryPage, options)
            : undefined,
        isSidebarFlattened: flattenedApiDefinition?.isSidebarFlattened ?? false,
    };
}

async function serializePageDescriptionMdx<
    R extends SidebarNode.Page,
    P extends SidebarNodeRaw.Page = SidebarNodeRaw.Page,
>(page: P, options?: FernSerializeMdxOptions): Promise<R> {
    if (SidebarNodeRaw.isEndpointPage(page) && page.stream != null) {
        return {
            ...page,
            description: await maybeSerializeMdxContent(page.description, options),
            stream: await serializePageDescriptionMdx(page.stream, options),
        } as unknown as R;
    }
    return {
        ...page,
        description: await maybeSerializeMdxContent(page.description, options),
    } as unknown as R;
}
