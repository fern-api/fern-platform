import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode, SidebarNodeRaw } from "@fern-ui/fdr-utils";
import { serializeMdxContent } from "../mdx/mdx";

export async function serializeSidebarNodeDescriptionMdx(node: SidebarNodeRaw): Promise<SidebarNode> {
    return visitDiscriminatedUnion(node, "type")._visit<Promise<SidebarNode>>({
        pageGroup: async (pageGroup): Promise<SidebarNode.PageGroup> => ({
            ...pageGroup,
            pages: await Promise.all(
                pageGroup.pages.map(
                    async (page): Promise<SidebarNode.PageGroup["pages"][0]> =>
                        page.type === "page"
                            ? await serializePageDescriptionMdx(page)
                            : page.type === "section"
                              ? await serializeSectionDescriptionMdx(page)
                              : page,
                ),
            ),
        }),
        apiSection: serializeApiSectionDescriptionMdx,
        section: serializeSectionDescriptionMdx,
        _other: (node) => Promise.resolve(node as SidebarNode),
    });
}

async function serializeSectionDescriptionMdx(section: SidebarNodeRaw.Section): Promise<SidebarNode.Section> {
    return {
        ...section,
        items: await Promise.all(section.items.map(serializeSidebarNodeDescriptionMdx)),
    };
}

async function serializeApiSectionDescriptionMdx(
    apiSection: SidebarNodeRaw.ApiSection,
): Promise<SidebarNode.ApiSection> {
    return {
        ...apiSection,
        items: await Promise.all(
            apiSection.items.map((page) =>
                page.type === "page"
                    ? serializePageDescriptionMdx<SidebarNode.ApiPage>(page)
                    : page.type === "apiSection"
                      ? (serializeApiSectionDescriptionMdx(page) as Promise<SidebarNode.SubpackageSection>)
                      : serializeSidebarNodeDescriptionMdx(page),
            ),
        ),
        changelog: apiSection.changelog
            ? await serializePageDescriptionMdx<SidebarNode.ChangelogPage>(apiSection.changelog)
            : undefined,
        summary: apiSection.summaryPage,
    };
}

async function serializePageDescriptionMdx<
    R extends SidebarNode.Page,
    P extends SidebarNodeRaw.Page = SidebarNodeRaw.Page,
>({ description, ...page }: P): Promise<R> {
    return {
        ...page,
        description: await serializeMdxContent(description),
    } as unknown as R;
}
