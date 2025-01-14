import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { once } from "es-toolkit/function";
import { FernNavigation } from "./..";
import { pruneVersionNode } from "./utils/pruneVersionNode";
import { NavigationNodeWithMetadata } from "./versions";

interface NavigationNodeWithMetadataAndParents {
  node: FernNavigation.NavigationNodeWithMetadata;
  parents: readonly FernNavigation.NavigationNodeParent[];
  next: FernNavigation.NavigationNodeNeighbor | undefined;
  prev: FernNavigation.NavigationNodeNeighbor | undefined;
}

const NodeCollectorInstances = new WeakMap<
  FernNavigation.NavigationNode,
  NodeCollector
>();

export class NodeCollector {
  private static readonly EMPTY = new NodeCollector(undefined);
  private nodesInOrder: FernNavigation.NavigationNode[] = [];
  private idToNode = new Map<
    FernNavigation.NodeId,
    FernNavigation.NavigationNode
  >();
  private idToNodeParents = new Map<
    FernNavigation.NodeId,
    readonly FernNavigation.NavigationNodeParent[]
  >();
  private slugToNode = new Map<
    FernNavigation.Slug,
    NavigationNodeWithMetadataAndParents
  >();
  private orphanedNodes: FernNavigation.NavigationNodeWithMetadata[] = [];

  public static collect(
    rootNode: FernNavigation.NavigationNode | undefined
  ): NodeCollector {
    if (rootNode == null) {
      return NodeCollector.EMPTY;
    }
    const existing = NodeCollectorInstances.get(rootNode);
    if (existing != null) {
      return existing;
    }
    const instance = new NodeCollector(rootNode);
    NodeCollectorInstances.set(rootNode, instance);
    return instance;
  }

  #last: NavigationNodeWithMetadataAndParents | undefined;
  #lastNeighboringNode: FernNavigation.NavigationNodeNeighbor | undefined;
  #setNode(
    slug: FernNavigation.Slug,
    node: FernNavigation.NavigationNodeWithMetadata,
    parents: readonly FernNavigation.NavigationNodeParent[]
  ) {
    const toSet = {
      node,
      parents,
      prev: this.#lastNeighboringNode,
      next: undefined,
    };
    this.slugToNode.set(slug, toSet);

    if (FernNavigation.isNeighbor(node) && !node.hidden) {
      this.#lastNeighboringNode = node;
      if (this.#last != null) {
        this.#last.next = node;
      }
      this.#last = toSet;
    }
  }

  private defaultVersion: FernNavigation.VersionNode | undefined;
  private versionNodes: FernNavigation.VersionNode[] = [];
  constructor(rootNode: FernNavigation.NavigationNode | undefined) {
    if (rootNode == null) {
      return;
    }
    FernNavigation.traverseDF(rootNode, (node, parents) => {
      // if the node is the default version, make a copy of it and "prune" the version slug from all children nodes
      if (node.type === "version") {
        this.versionNodes.push(node);
      }

      if (node.type === "version" && node.default && rootNode.type === "root") {
        const copy = JSON.parse(
          JSON.stringify(node)
        ) as FernNavigation.VersionNode;
        this.defaultVersion = pruneVersionNode(copy, rootNode.slug, node.slug);
        FernNavigation.traverseDF(this.defaultVersion, (node, innerParents) => {
          this.visitNode(node, [...parents, ...innerParents], true);
        });
      }

      this.visitNode(node, parents);
    });
  }

  private visitNode(
    node: FernNavigation.NavigationNode,
    parents: readonly FernNavigation.NavigationNodeParent[],
    isDefaultVersion = false
  ): void {
    if (!this.idToNode.has(node.id) || isDefaultVersion) {
      this.idToNode.set(node.id, node);
      this.idToNodeParents.set(node.id, parents);
      this.nodesInOrder.push(node);
    }

    if (node.type === "sidebarRoot") {
      this.#last = undefined;
      this.#lastNeighboringNode = undefined;
    }

    // there's currently no visitable page for changelog months and years
    if (
      !FernNavigation.hasMetadata(node) ||
      node.type === "changelogMonth" ||
      node.type === "changelogYear"
    ) {
      return;
    }

    const existing = this.slugToNode.get(node.slug);
    if (existing == null) {
      this.#setNode(node.slug, node, parents);
    } else if (
      !node.hidden &&
      FernNavigation.isPage(node) &&
      (existing.node.hidden || !FernNavigation.isPage(existing.node))
    ) {
      this.orphanedNodes.push(existing.node);
      this.#setNode(node.slug, node, parents);
    } else {
      if (FernNavigation.isPage(existing.node)) {
        console.warn(`Duplicate slug found: ${node.slug}`, node.title);
      }
      this.orphanedNodes.push(node);
    }
  }

  public getOrphanedNodes(): FernNavigation.NavigationNodeWithMetadata[] {
    return this.orphanedNodes;
  }

  public getOrphanedPages = once(
    (): FernNavigation.NavigationNodeWithMetadata[] => {
      return this.orphanedNodes.filter(FernNavigation.isPage);
    }
  );

  private getSlugMap = once(
    (): Map<string, FernNavigation.NavigationNodeWithMetadata> => {
      return new Map(
        [...this.slugToNode.entries()].map(([slug, { node }]) => [slug, node])
      );
    }
  );

  get slugMap(): Map<string, FernNavigation.NavigationNodeWithMetadata> {
    return this.getSlugMap();
  }

  get defaultVersionNode(): FernNavigation.VersionNode | undefined {
    return this.defaultVersion;
  }

  public get(
    id: FernNavigation.NodeId
  ): FernNavigation.NavigationNode | undefined {
    return this.idToNode.get(id);
  }

  public getParents(
    id: FernNavigation.NodeId
  ): readonly FernNavigation.NavigationNodeParent[] {
    return this.idToNodeParents.get(id) ?? EMPTY_ARRAY;
  }

  public getSlugMapWithParents = (): ReadonlyMap<
    FernNavigation.Slug,
    NavigationNodeWithMetadataAndParents
  > => {
    return this.slugToNode;
  };

  #getSlugs = once((): string[] => {
    return [...this.slugToNode.keys()];
  });
  get slugs(): string[] {
    return this.#getSlugs();
  }

  /**
   * Returns a list of slugs for all pages in the navigation tree.
   *
   * This includes hidden pages and noindex pages, but not authed pages, and is intended for revalidation purposes.
   *
   * @returns {string[]} A list of slugs for all canonical pages in the navigation tree.
   */
  #getStaticPageSlugs = once((): string[] => {
    return Array.from(
      new Set(
        [...this.slugToNode.values()]
          .filter(({ node }) => FernNavigation.isPage(node))
          .filter(({ node }) => !node.authed)
          .map(({ node }) => node.slug)
      )
    );
  });
  get staticPageSlugs(): string[] {
    return this.#getStaticPageSlugs();
  }

  /**
   * Returns a list of slugs for pages that should be indexed by search engines, and by algolia.
   *
   * This excludes hidden pages and noindex pages, and uses the canonical slug if it exists.
   */
  #getIndexablePageSlugs = once((): string[] => {
    return Array.from(
      new Set(
        [...this.slugToNode.values()]
          .filter(({ node }) => FernNavigation.isPage(node))
          .filter(({ node }) => !node.hidden && !node.authed)
          .filter(({ node }) =>
            FernNavigation.hasMarkdown(node) ? !node.noindex : true
          )
          .map(({ node }) => node.canonicalSlug ?? node.slug)
      )
    );
  });
  get indexablePageSlugs(): string[] {
    return this.#getIndexablePageSlugs();
  }

  #getIndexablePageNodesWithAuth = once((): NavigationNodeWithMetadata[] => {
    const slugRecord: Record<string, NavigationNodeWithMetadata> = {};

    [...this.slugToNode.values()]
      .filter(({ node }) => FernNavigation.isPage(node))
      .filter(({ node }) => !node.hidden)
      .filter(({ node }) =>
        FernNavigation.hasMarkdown(node) ? !node.noindex : true
      )
      .forEach((node) => {
        const canonicalSlug = node.node.canonicalSlug ?? node.node.slug;
        // Only keep the first node we see for each canonical slug
        if (!(canonicalSlug in slugRecord)) {
          slugRecord[canonicalSlug] = node.node;
        }
      });

    return Object.values(slugRecord);
  });
  get indexablePageNodesWithAuth(): NavigationNodeWithMetadata[] {
    return this.#getIndexablePageNodesWithAuth();
  }

  public getVersionNodes = (): FernNavigation.VersionNode[] => {
    return this.versionNodes;
  };

  public getNodesInOrder = (): FernNavigation.NavigationNode[] => {
    return this.nodesInOrder;
  };
}
