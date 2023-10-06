import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../fern";
import { NODE_FACTORY } from "./node-factory";
import type { ResolvedNavigatableNode, ResolvedNode, ResolvedNodeTab, ResolvedNodeVersion, UrlSlug } from "./types";
import { joinUrlSlugs } from "./util";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    private readonly nodesBySlug: Map<UrlSlug, ResolvedNode>;

    public constructor(public readonly config: PathResolverConfig) {
        this.nodesBySlug = new Map();
        this.preprocessDefinition();
    }

    public resolveSlug(slug: UrlSlug): ResolvedNode | undefined {
        return this.nodesBySlug.get(slug);
    }

    public resolveNavigatable(slug: string): ResolvedNavigatableNode | undefined;
    public resolveNavigatable(resolvedNode: ResolvedNode): ResolvedNavigatableNode;
    public resolveNavigatable(slugOrNode: string | ResolvedNode): ResolvedNavigatableNode | undefined {
        const resolvedNode = typeof slugOrNode === "string" ? this.nodesBySlug.get(slugOrNode) : slugOrNode;
        return resolvedNode != null ? this.#resolveNavigatable(resolvedNode) : undefined;
    }

    #resolveNavigatable(resolvedNode: ResolvedNode): ResolvedNavigatableNode | undefined {
        let cur: ResolvedNode | undefined = resolvedNode;
        while (cur != null) {
            if (cur.type === "endpoint" || cur.type === "page") {
                return cur;
            }
            // TODO: Go to first child
            cur = cur.children.get(cur.slug);
        }
        return undefined;
    }

    public getAllSlugs(): UrlSlug[] {
        return Array.from(this.nodesBySlug.keys());
    }

    private preprocessDefinition() {
        const navigationConfig = this.config.docsDefinition.config.navigation;
        if (isVersionedNavigationConfig(navigationConfig)) {
            navigationConfig.versions.forEach((version, versionIndex) => {
                const versionNode = NODE_FACTORY.version.create({
                    slug: version.urlSlug,
                    version: { id: version.version, slug: version.urlSlug },
                });
                this.nodesBySlug.set(joinUrlSlugs(versionNode.slug), versionNode);
                if (isUnversionedTabbedNavigationConfig(version.config)) {
                    version.config.tabs.forEach((tab, tabIndex) => {
                        const tabNode = NODE_FACTORY.tab.create({
                            slug: tab.urlSlug,
                            version: { id: version.version, slug: version.urlSlug },
                        });
                        this.nodesBySlug.set(joinUrlSlugs(versionNode.slug, tabNode.slug), tabNode);
                        versionNode.children.set(tabNode.slug, tabNode);
                        this.deepTraverseItems(
                            tab.items,
                            {
                                id: version.version,
                                slug: version.urlSlug,
                            },
                            {
                                slug: tab.urlSlug,
                                index: tabIndex,
                            },
                            [version.urlSlug, tab.urlSlug]
                        );
                        if (versionIndex === 0) {
                            // Special handling for default version
                            this.nodesBySlug.set(joinUrlSlugs(tabNode.slug), tabNode);
                            this.deepTraverseItems(
                                tab.items,
                                {
                                    id: version.version,
                                    slug: version.urlSlug,
                                },
                                {
                                    slug: tab.urlSlug,
                                    index: tabIndex,
                                },
                                [tab.urlSlug]
                            );
                        }
                    });
                } else {
                    this.deepTraverseItems(
                        version.config.items,
                        {
                            id: version.version,
                            slug: version.urlSlug,
                        },
                        null,
                        [version.urlSlug]
                    );
                    if (versionIndex === 0) {
                        // Special handling for default version
                        this.deepTraverseItems(
                            version.config.items,
                            {
                                id: version.version,
                                slug: version.urlSlug,
                            },
                            null,
                            []
                        );
                    }
                }
            });
        } else {
            if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
                navigationConfig.tabs.forEach((tab, tabIndex) => {
                    const tabNode = NODE_FACTORY.tab.create({ slug: tab.urlSlug });
                    this.nodesBySlug.set(tabNode.slug, tabNode);
                    this.deepTraverseItems(
                        tab.items,
                        null,
                        {
                            slug: tab.urlSlug,
                            index: tabIndex,
                        },
                        [tab.urlSlug]
                    );
                });
            } else {
                this.deepTraverseItems(navigationConfig.items, null, null, []);
            }
        }
    }

    private deepTraverseItems(
        navigationItems: FernRegistryDocsRead.NavigationItem[],
        version: ResolvedNodeVersion | null,
        tab: ResolvedNodeTab | null,
        slugs: string[]
    ) {
        navigationItems.forEach((item) => {
            visitDiscriminatedUnion(item, "type")._visit({
                page: (item) => {
                    const node: ResolvedNode.Page = {
                        type: "page",
                        page: item,
                        slug: item.urlSlug,
                        version,
                        tab,
                    };
                    this.nodesBySlug.set(joinUrlSlugs(...slugs, node.slug), node);
                },
                api: (item) => {
                    const node: ResolvedNode.ApiSection = {
                        type: "api-section",
                        section: item,
                        children: new Map(),
                        slug: item.urlSlug,
                        version,
                        tab,
                    };
                    this.nodesBySlug.set(joinUrlSlugs(...slugs, node.slug), node);
                },
                section: (item) => {
                    const node: ResolvedNode.DocsSection = {
                        type: "docs-section",
                        section: item,
                        children: new Map(),
                        slug: item.urlSlug,
                        version,
                        tab,
                    };
                    this.nodesBySlug.set(joinUrlSlugs(...slugs, node.slug), node);
                    this.deepTraverseItems(item.items, version, tab, [...slugs, node.slug]);
                },
                _other: noop,
            });
        });
    }
}
