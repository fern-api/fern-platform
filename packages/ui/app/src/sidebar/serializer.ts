import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { serializeMdxContent } from "../mdx/mdx";
import { SidebarNode, SidebarNodeRaw } from "./types";

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
        endpoints: await Promise.all(
            apiSection.endpoints.map((page) => serializePageDescriptionMdx<SidebarNode.EndpointPage>(page)),
        ),
        webhooks: await Promise.all(
            apiSection.webhooks.map((page) => serializePageDescriptionMdx<SidebarNode.ApiPage>(page)),
        ),
        websockets: await Promise.all(
            apiSection.websockets.map((page) => serializePageDescriptionMdx<SidebarNode.ApiPage>(page)),
        ),
        subpackages: await Promise.all(apiSection.subpackages.map(serializeApiSectionDescriptionMdx)),
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
        description: await serializeMdxContent(description),
    } as unknown as R;
}
