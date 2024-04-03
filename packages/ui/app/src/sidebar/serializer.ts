import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode, SidebarNodeRaw } from "@fern-ui/fdr-utils";
import { SerializeMdxOptions, maybeSerializeMdxContent } from "../mdx/mdx";

export async function serializeSidebarNodeDescriptionMdx(
    node: SidebarNodeRaw,
    options?: SerializeMdxOptions,
): Promise<SidebarNode> {
    return visitDiscriminatedUnion(node, "type")._visit<Promise<SidebarNode>>({
        pageGroup: async (pageGroup) => ({
            ...pageGroup,
            pages: await Promise.all(
                pageGroup.pages.map(async (page) =>
                    page.type === "page" ? await serializePageDescriptionMdx(page, options) : page,
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
    apiSection: SidebarNodeRaw.ApiSection,
    options?: SerializeMdxOptions,
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
    };
}

async function serializePageDescriptionMdx<
    R extends SidebarNode.Page,
    P extends SidebarNodeRaw.Page = SidebarNodeRaw.Page,
>({ description, ...page }: P, options?: SerializeMdxOptions): Promise<R> {
    return {
        ...page,
        description: await maybeSerializeMdxContent(description, options),
    } as unknown as R;
}
