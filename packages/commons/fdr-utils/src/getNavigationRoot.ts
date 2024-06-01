// import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
// import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
// import { resolveSidebarNodesRoot } from "./resolver";
// import { SidebarNavigationRaw, SidebarNodeRaw, SidebarTab } from "./types";
// import { visitSidebarNodeRaw } from "./visitSidebarNodeRaw";

import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { SidebarNavigationRaw } from "./types";

interface Redirect {
    type: "redirect";
    redirect: string;
}

interface Found {
    type: "found";
    found: SidebarNavigationRaw;
}

// function isSidebarNodeRaw(
//     n: SidebarNodeRaw.VisitableNode | SidebarNodeRaw.TabLink | SidebarNodeRaw.Link,
// ): n is SidebarNodeRaw {
//     return n.type === "apiSection" || n.type === "pageGroup" || n.type === "section";
// }

// function isNavigationNode(n: SidebarNodeRaw.VisitableNode): n is SidebarNodeRaw.NavigationNode {
//     return n.type === "root" || n.type === "tabGroup" || n.type === "versionGroup";
// }

// // lower number means higher priority
// const PRIORITY_LIST: Record<SidebarNodeRaw.VisitableNode["type"], number> = {
//     root: 6,
//     section: 5,
//     apiSection: 4,
//     tabGroup: 3,
//     versionGroup: 2,
//     pageGroup: 1,
//     tabChangelog: 0,
//     page: 0,
// };

export function getNavigationRoot(
    _slugArray: string[],
    _domain: string,
    _basePath: string | undefined,
    _nav: DocsV1Read.NavigationConfig,
    _apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    _pages: Record<string, DocsV1Read.PageContent>,
): Found | Redirect | undefined {
    return undefined;
}

// export function getNavigationRoot(
//     slugArray: string[],
//     domain: string,
//     basePath: string | undefined,
//     nav: DocsV1Read.NavigationConfig,
//     apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
//     pages: Record<string, DocsV1Read.PageContent>,
// ): Found | Redirect | undefined {
//     const basePathSlug = basePath != null ? basePath.split("/").filter((t) => t.length > 0) : [];

//     const root = resolveSidebarNodesRoot(nav, apis, pages, basePathSlug, domain);
//     const hits: { node: SidebarNodeRaw.VisitableNode; parents: SidebarNodeRaw.ParentNode[] }[] = [];

//     visitSidebarNodeRaw(root, (node, parents) => {
//         if (node.slug === slugArray.join("/")) {
//             hits.push({ node, parents });
//         }
//     });

//     if (hits[0] == null) {
//         // match on top-level versions if the slug starts with a version
//         // ignore the first item, which doesn't contain a version
//         for (const rootItem of root.items.slice(1)) {
//             if (rootItem.type === "versionGroup") {
//                 const versionSlug = rootItem.slug;
//                 if (slugArray.join("/").startsWith(rootItem.slug)) {
//                     return { type: "redirect", redirect: `/${versionSlug}` };
//                 }
//             }
//         }

//         return undefined;
//     }

//     if (hits.length > 1) {
//         // eslint-disable-next-line no-console
//         console.error(`Multiple navigation items found for slug: ${slugArray.join("/")}`);
//         // eslint-disable-next-line no-console
//         console.log(hits.map((h) => h.node));
//     }

//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const hit = hits.sort((a, b) => PRIORITY_LIST[a.node.type] - PRIORITY_LIST[b.node.type])[0]!;

//     const { node, parents } = hit;

//     if (shouldRedirect(node)) {
//         return resolveRedirect(node, slugArray);
//     }

//     const sidebarNodes = findSiblings<SidebarNodeRaw>(parents, isSidebarNodeRaw).items;

//     const { items: tabItems, node: currentTab } = findSiblings<SidebarNodeRaw.Tab>(
//         parents,
//         (n): n is SidebarNodeRaw.TabGroup => n.type === "tabGroup",
//     );

//     const tabs = tabItems
//         .filter((n) => n.type === "tabGroup" || n.type === "tabChangelog" || n.type === "tabLink")
//         .map((tab) =>
//             visitDiscriminatedUnion(tab, "type")._visit<SidebarTab>({
//                 tabLink: (link) => link,
//                 tabGroup: (group) => ({
//                     type: "tabGroup",
//                     title: group.title,
//                     icon: group.icon,
//                     index: group.index,
//                     slug: group.slug,
//                 }),
//                 tabChangelog: (changelog) => ({
//                     type: "tabChangelog",
//                     title: changelog.title,
//                     icon: changelog.icon,
//                     index: changelog.index,
//                     slug: changelog.slug,
//                 }),
//                 _other: (other) => assertNever(other as never),
//             }),
//         );

//     const { items: versionItems, node: currentVerion } = findSiblings<SidebarNodeRaw.VersionGroup>(
//         parents,
//         (n): n is SidebarNodeRaw.VersionGroup => n.type === "versionGroup",
//     );

//     const versions = versionItems
//         .map((version) => ({
//             id: version.id,
//             slug: version.slug,
//             index: version.index,
//             availability: version.availability,
//         }))
//         // get rid of duplicate version
//         .filter((version, idx) => version.index > 0 || version.index === idx);

//     // const sidebarNodes = await Promise.all(rawSidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)));
//     const found: SidebarNavigationRaw = {
//         currentVersionIndex: currentVerion?.index ?? -1,
//         versions,
//         currentTabIndex: currentTab?.index ?? -1,
//         tabs,
//         sidebarNodes,
//         currentNode: node,
//     };

//     return { type: "found", found };
// }

// function shouldRedirect(node: SidebarNodeRaw.VisitableNode): boolean {
//     return isNavigationNode(node) || node.type === "section" || node.type === "pageGroup" || node.type === "apiSection";
// }

// function resolveRedirect(node: SidebarNodeRaw.VisitableNode | undefined, from: string[]): Redirect | undefined {
//     if (node == null) {
//         return undefined;
//     }

//     if (isNavigationNode(node) || node.type === "section") {
//         const firstChild = node.items.filter(
//             (
//                 item,
//             ): item is
//                 | SidebarNodeRaw.TabGroup
//                 | SidebarNodeRaw.TabChangelogPage
//                 | SidebarNodeRaw.VersionGroup
//                 | SidebarNodeRaw => item.type !== "tabLink",
//         )[0];
//         return resolveRedirect(firstChild, from);
//     }

//     if (node.type === "pageGroup") {
//         const firstPage = node.pages.find(SidebarNodeRaw.isPage);
//         return resolveRedirect(firstPage, from);
//     }

//     if (node.type === "apiSection") {
//         const firstChild = node.summaryPage ?? node.items[0] ?? node.changelog;
//         return resolveRedirect(firstChild, from);
//     }

//     if (node.slug === from.join("/")) {
//         return undefined;
//     }
//     return { type: "redirect", redirect: "/" + node.slug };
// }

// function findSiblings<T extends SidebarNodeRaw.ParentNode | SidebarNodeRaw.TabLink | SidebarNodeRaw.TabChangelogPage>(
//     parents: readonly SidebarNodeRaw.ParentNode[],
//     match: (
//         node:
//             | SidebarNodeRaw.VisitableNode
//             | SidebarNodeRaw.TabLink
//             | SidebarNodeRaw.Link
//             | SidebarNodeRaw.TabChangelogPage,
//     ) => boolean,
// ): { items: readonly T[]; node: T | undefined } {
//     const navigationDepth = parents.findIndex(match);

//     const parent = parents[navigationDepth - 1] ?? parents[parents.length - 1];

//     if (parent == null) {
//         return { items: [], node: undefined };
//     }

//     if (
//         parent.type !== "root" &&
//         parent.type !== "tabGroup" &&
//         parent.type !== "versionGroup" &&
//         parent.type !== "section"
//     ) {
//         return { items: [], node: undefined };
//     }

//     return { items: parent.items.filter(match) as T[], node: parents[navigationDepth] as T | undefined };
// }
