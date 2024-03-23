import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import {
    resolveSidebarNodesRoot,
    serializeSidebarNodeDescriptionMdx,
    SidebarNavigation,
    SidebarNodeRaw,
} from "@fern-ui/ui";
import { sortBy } from "lodash-es";
import { visitSidebarNodeRaw } from "./visitSidebarNodeRaw";

interface Redirect {
    type: "redirect";
    redirect: string;
}

interface Found {
    type: "found";
    found: SidebarNavigation;
}

function isSidebarNodeRaw<T extends SidebarNodeRaw.VisitableNode>(
    n: T,
): n is Exclude<T, SidebarNodeRaw.NavigationNode> {
    return n.type !== "root" && n.type !== "tabGroup" && n.type !== "versionGroup";
}

function isNavigationNode(n: SidebarNodeRaw.VisitableNode): n is SidebarNodeRaw.NavigationNode {
    return n.type === "root" || n.type === "tabGroup" || n.type === "versionGroup";
}

const PRIORITY_LIST: Record<SidebarNodeRaw.VisitableNode["type"], number> = {
    root: 3,
    tabGroup: 2,
    versionGroup: 2,
    section: 2,
    apiSection: 2,
    pageGroup: 1,
    page: 0,
};

export async function getNavigationRoot(
    slugArray: string[],
    basePath: string | undefined,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    nav: DocsV1Read.NavigationConfig,
): Promise<Found | Redirect | undefined> {
    const root = resolveSidebarNodesRoot(nav, apis, basePath);
    const hits: { node: SidebarNodeRaw.VisitableNode; parents: SidebarNodeRaw.ParentNode[] }[] = [];

    visitSidebarNodeRaw(root, (node, parents) => {
        if (node.slug.join("/") === slugArray.join("/")) {
            hits.push({ node, parents });
        }
    });

    if (hits[0] == null) {
        return undefined;
    }

    if (hits.length > 1) {
        // eslint-disable-next-line no-console
        console.error(`Multiple navigation items found for slug: ${slugArray.join("/")}`);
        // eslint-disable-next-line no-console
        console.log(hits.map((h) => h.node));
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hit = sortBy(hits, ({ node }) => PRIORITY_LIST[node.type])[0]!;
    const { node, parents } = hit;

    if (isNavigationNode(node) || node.type === "section") {
        const firstChild = node.items[0];
        if (firstChild == null) {
            return undefined;
        }
        return { type: "redirect", redirect: "/" + firstChild.slug.join("/") };
    }

    if (node.type === "pageGroup") {
        const firstPage = node.pages.find(SidebarNodeRaw.isPage);
        if (firstPage == null) {
            return undefined;
        }
        return { type: "redirect", redirect: "/" + firstPage.slug.join("/") };
    }

    if (node.type === "apiSection") {
        const firstChild = node.items[0] ?? node.changelog;
        if (firstChild == null) {
            return undefined;
        }
        return { type: "redirect", redirect: "/" + firstChild.slug.join("/") };
    }

    const rawSidebarNodes = findSiblings<SidebarNodeRaw>(parents, isSidebarNodeRaw).items;

    const tabs = findSiblings<SidebarNodeRaw.TabGroup>(
        parents,
        (n): n is SidebarNodeRaw.TabGroup => n.type === "tabGroup",
    );

    const versions = findSiblings<SidebarNodeRaw.VersionGroup>(
        parents,
        (n): n is SidebarNodeRaw.VersionGroup => n.type === "versionGroup",
    );

    const sidebarNodes = await Promise.all(rawSidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)));
    const found = {
        currentVersionIndex: versions.index,
        versions: versions.items.map((version) => ({
            id: version.id,
            slug: version.slug,
            index: version.index,
            availability: version.availability,
        })),
        currentTabIndex: tabs.index,
        tabs: tabs.items.map((tab) => ({
            title: tab.title,
            icon: tab.icon,
            slug: tab.slug,
        })),
        sidebarNodes,
    };

    return { type: "found", found };
}

function findSiblings<T extends SidebarNodeRaw.ParentNode>(
    parents: readonly SidebarNodeRaw.ParentNode[],
    match: (node: SidebarNodeRaw.ParentNode) => node is T,
): { items: readonly T[]; index: number } {
    const navigationDepth = parents.findIndex(match);

    const parent = parents[navigationDepth - 1] ?? parents[parents.length - 1];

    if (parent == null) {
        return { items: [], index: -1 };
    }

    if (
        parent.type !== "root" &&
        parent.type !== "tabGroup" &&
        parent.type !== "versionGroup" &&
        parent.type !== "section"
    ) {
        return { items: [], index: -1 };
    }

    return { items: parent.items as T[], index: parent.items.findIndex((node) => node === parents[navigationDepth]) };
}
