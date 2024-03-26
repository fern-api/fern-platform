import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { resolveSidebarNodesRoot } from "./resolver";
import { SidebarNavigationRaw, SidebarNodeRaw } from "./types";
import { visitSidebarNodeRaw } from "./visitSidebarNodeRaw";

interface Redirect {
    type: "redirect";
    redirect: string;
}

interface Found {
    type: "found";
    found: SidebarNavigationRaw;
}

function isSidebarNodeRaw<T extends SidebarNodeRaw.VisitableNode>(
    n: T,
): n is Exclude<T, SidebarNodeRaw.NavigationNode> {
    return n.type !== "root" && n.type !== "tabGroup" && n.type !== "versionGroup";
}

function isNavigationNode(n: SidebarNodeRaw.VisitableNode): n is SidebarNodeRaw.NavigationNode {
    return n.type === "root" || n.type === "tabGroup" || n.type === "versionGroup";
}

// lower number means higher priority
const PRIORITY_LIST: Record<SidebarNodeRaw.VisitableNode["type"], number> = {
    root: 3,
    tabGroup: 2,
    versionGroup: 2,
    section: 2,
    apiSection: 2,
    pageGroup: 1,
    page: 0,
};

export function getNavigationRoot(
    slugArray: string[],
    basePath: string | undefined,
    nav: DocsV1Read.NavigationConfig,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
): Found | Redirect | undefined {
    const basePathSlug = basePath != null ? basePath.split("/").filter((t) => t.length > 0) : [];

    const root = resolveSidebarNodesRoot(nav, apis, basePathSlug);
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
    const hit = hits.sort((a, b) => PRIORITY_LIST[a.node.type] - PRIORITY_LIST[b.node.type])[0]!;

    const { node, parents } = hit;

    if (shouldRedirect(node)) {
        return resolveRedirect(node, slugArray);
    }

    const sidebarNodes = findSiblings<SidebarNodeRaw>(parents, isSidebarNodeRaw).items;

    const { items: tabItems, node: currentTab } = findSiblings<SidebarNodeRaw.TabGroup>(
        parents,
        (n): n is SidebarNodeRaw.TabGroup => n.type === "tabGroup",
    );

    const tabs = tabItems.map((tab) => ({
        title: tab.title,
        icon: tab.icon,
        slug: tab.slug,
        index: tab.index,
    }));

    const { items: versionItems, node: currentVerion } = findSiblings<SidebarNodeRaw.VersionGroup>(
        parents,
        (n): n is SidebarNodeRaw.VersionGroup => n.type === "versionGroup",
    );

    const versions = versionItems
        .map((version) => ({
            id: version.id,
            slug: version.slug,
            index: version.index,
            availability: version.availability,
        }))
        // get rid of duplicate version
        .filter((version, idx) => version.index > 0 || version.index === idx);

    // const sidebarNodes = await Promise.all(rawSidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)));
    const found: SidebarNavigationRaw = {
        currentVersionIndex: currentVerion?.index ?? -1,
        versions,
        currentTabIndex: currentTab?.index ?? -1,
        tabs,
        sidebarNodes,
        currentNode: node,
    };

    return { type: "found", found };
}

function shouldRedirect(node: SidebarNodeRaw.VisitableNode): boolean {
    return isNavigationNode(node) || node.type === "section" || node.type === "pageGroup" || node.type === "apiSection";
}

function resolveRedirect(node: SidebarNodeRaw.VisitableNode | undefined, from: string[]): Redirect | undefined {
    if (node == null) {
        return undefined;
    }

    if (isNavigationNode(node) || node.type === "section") {
        const firstChild = node.items[0];
        return resolveRedirect(firstChild, from);
    }

    if (node.type === "pageGroup") {
        const firstPage = node.pages.find(SidebarNodeRaw.isPage);
        return resolveRedirect(firstPage, from);
    }

    if (node.type === "apiSection") {
        const firstChild = node.items[0] ?? node.changelog;
        return resolveRedirect(firstChild, from);
    }

    if (node.slug.join("/") === from.join("/")) {
        return undefined;
    }
    return { type: "redirect", redirect: "/" + node.slug.join("/") };
}

function findSiblings<T extends SidebarNodeRaw.ParentNode>(
    parents: readonly SidebarNodeRaw.ParentNode[],
    match: (node: SidebarNodeRaw.ParentNode) => node is T,
): { items: readonly T[]; node: T | undefined } {
    const navigationDepth = parents.findIndex(match);

    const parent = parents[navigationDepth - 1] ?? parents[parents.length - 1];

    if (parent == null) {
        return { items: [], node: undefined };
    }

    if (
        parent.type !== "root" &&
        parent.type !== "tabGroup" &&
        parent.type !== "versionGroup" &&
        parent.type !== "section"
    ) {
        return { items: [], node: undefined };
    }

    return { items: parent.items as T[], node: parents[navigationDepth] as T | undefined };
}
