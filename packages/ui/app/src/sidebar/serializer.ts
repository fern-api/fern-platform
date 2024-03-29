import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode, SidebarNodeRaw } from "@fern-ui/fdr-utils";
import { maybeSerializeMdxContent } from "../mdx/mdx";

export async function serializeSidebarNodeDescriptionMdx(node: SidebarNodeRaw): Promise<SidebarNode> {
    return visitDiscriminatedUnion(node, "type")._visit<Promise<SidebarNode>>({
        pageGroup: async (pageGroup) => ({
            ...pageGroup,
            pages: await Promise.all(
                pageGroup.pages.map(async (page) =>
                    page.type === "page" ? await serializePageDescriptionMdx(page) : page,
                ),
            ),
        }),
        apiSection: serializeApiSectionDescriptionMdx,
        section: async (section) => ({
            ...section,
            items: await Promise.all(section.items.map(serializeSidebarNodeDescriptionMdx)),
        }),
        _other: (node) => Promise.resolve(node as SidebarNode),
    });
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
                    : (serializeApiSectionDescriptionMdx(page) as Promise<SidebarNode.SubpackageSection>),
            ),
        ),
        changelog: apiSection.changelog
            ? await serializePageDescriptionMdx<SidebarNode.ChangelogPage>(apiSection.changelog)
            : undefined,
    };
}

async function serializePageDescriptionMdx<
    R extends SidebarNode.Page,
    P extends SidebarNodeRaw.Page = SidebarNodeRaw.Page,
>({ description, ...page }: P): Promise<R> {
    return {
        ...page,
        description: await maybeSerializeMdxContent(description),
    } as unknown as R;
}
