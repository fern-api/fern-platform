import { NodeId, PageId, RoleId, Slug } from "@fern-api/fdr-sdk/navigation";
import type {
  NavigationChild,
  PageNode,
  RootNode,
  SectionNode,
  SidebarRootChild,
} from "@fern-api/fdr-sdk/navigation";

import { withPrunedNavigation } from "./withPrunedNavigation";

function createPageNode(id: string, title = "Should be hidden"): PageNode {
  return {
    type: "page",
    title,
    slug: Slug("hidden"),
    pageId: PageId("1.mdx"),
    canonicalSlug: undefined,
    authed: undefined,
    id: NodeId(id),
    hidden: undefined,
    icon: undefined,
    viewers: [RoleId("everyone")],
    orphaned: undefined,
    noindex: false,
    featureFlags: [],
  };
}

function createSectionNode(
  id: string,
  children: NavigationChild[],
  hidden = true
): SectionNode {
  return {
    type: "section",
    id: NodeId(id),
    children,
    title: "Public",
    slug: Slug("public"),
    canonicalSlug: undefined,
    authed: undefined,
    hidden,
    icon: undefined,
    viewers: [RoleId("private")],
    orphaned: undefined,
    noindex: false,
    collapsed: false,
    overviewPageId: PageId("1.mdx"),
    pointsTo: undefined,
    featureFlags: [],
  };
}

function createNestedSectionNode(
  id: string,
  children: NavigationChild[],
  hidden = undefined
): SectionNode {
  return {
    type: "section",
    id: NodeId(id),
    children,
    title: "Should be hidden",
    slug: Slug("hidden"),
    overviewPageId: PageId("1.mdx"),
    canonicalSlug: undefined,
    authed: undefined,
    hidden,
    icon: undefined,
    viewers: [RoleId("everyone")],
    orphaned: undefined,
    noindex: false,
    collapsed: false,
    pointsTo: undefined,
    featureFlags: [],
  };
}

function createRootNode(sectionChildren: SidebarRootChild[]): RootNode {
  return {
    type: "root",
    child: {
      id: NodeId("1"),
      landingPage: undefined,
      type: "unversioned",
      child: {
        type: "sidebarRoot",
        id: NodeId("2"),
        children: sectionChildren,
      },
    },
    version: "v2",
    title: "Root",
    slug: Slug("root"),
    canonicalSlug: undefined,
    authed: undefined,
    icon: undefined,
    hidden: false,
    id: NodeId("4"),
    viewers: undefined,
    orphaned: undefined,
    pointsTo: undefined,
    roles: [],
    featureFlags: [],
  };
}

describe("withPrunedNavigation", () => {
  it("child should be hidden if parent is hidden", () => {
    expect(
      withPrunedNavigation(
        createRootNode([createSectionNode("3", [createPageNode("1")])]),
        {
          visibleNodeIds: [],
          authed: false,
        }
      )
    ).toStrictEqual(createRootNode([]));
  });

  it("hidden parent should be visible is child is visible", () => {
    expect(
      withPrunedNavigation(
        createRootNode([createSectionNode("3", [createPageNode("5")])]),
        {
          visibleNodeIds: [NodeId("5"), NodeId("3")],
          authed: false,
        }
      )
    ).toStrictEqual(
      createRootNode([createSectionNode("3", [createPageNode("5")])])
    );
  });

  it("deeply hidden child should be hidden if parent is hidden", () => {
    expect(
      withPrunedNavigation(
        createRootNode([
          createSectionNode("3", [
            createNestedSectionNode("5", [createPageNode("1")]),
          ]),
        ]),
        {
          visibleNodeIds: [],
          authed: false,
        }
      )
    ).toStrictEqual(createRootNode([]));
  });

  it("parent should be visible is deeply hidden child is visible", () => {
    expect(
      withPrunedNavigation(
        createRootNode([
          createSectionNode("3", [
            createNestedSectionNode("5", [createPageNode("6")]),
          ]),
        ]),
        {
          visibleNodeIds: [NodeId("6"), NodeId("5"), NodeId("3")],
          authed: false,
        }
      )
    ).toStrictEqual(
      createRootNode([
        createSectionNode("3", [
          createNestedSectionNode("5", [createPageNode("6")]),
        ]),
      ])
    );
  });

  it("children should be hidden if parent is hidden", () => {
    expect(
      withPrunedNavigation(
        createRootNode([
          createSectionNode("3", [createPageNode("1"), createPageNode("1")]),
        ]),
        {
          visibleNodeIds: [],
          authed: false,
        }
      )
    ).toStrictEqual(createRootNode([]));
  });

  it("hidden parent and sibling should be visible is child is visible", () => {
    expect(
      withPrunedNavigation(
        createRootNode([
          createSectionNode("3", [createPageNode("5"), createPageNode("6")]),
        ]),
        {
          visibleNodeIds: [NodeId("5"), NodeId("3")],
          authed: false,
        }
      )
    ).toStrictEqual(
      createRootNode([
        createSectionNode("3", [createPageNode("5"), createPageNode("6")]),
      ])
    );
  });

  it("deeply hidden children should be hidden if parent is hidden", () => {
    expect(
      withPrunedNavigation(
        createRootNode([
          createSectionNode("3", [
            createNestedSectionNode("5", [
              createPageNode("1"),
              createPageNode("1"),
            ]),
          ]),
        ]),
        {
          visibleNodeIds: [],
          authed: false,
        }
      )
    ).toStrictEqual(createRootNode([]));
  });

  it("parent and sibling should be visible is deeply hidden child is visible", () => {
    expect(
      withPrunedNavigation(
        createRootNode([
          createSectionNode("3", [
            createNestedSectionNode("5", [
              createPageNode("6"),
              createPageNode("7"),
            ]),
          ]),
        ]),
        {
          visibleNodeIds: [NodeId("7"), NodeId("5"), NodeId("3")],
          authed: false,
        }
      )
    ).toStrictEqual(
      createRootNode([
        createSectionNode("3", [
          createNestedSectionNode("5", [
            createPageNode("6"),
            createPageNode("7"),
          ]),
        ]),
      ])
    );
  });
});
