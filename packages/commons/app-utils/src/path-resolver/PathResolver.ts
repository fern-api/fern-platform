import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../fern";
import type { ResolvedNode, ResolvedNodeTab, ResolvedNodeVersion, UrlSlug } from "./types";
import { joinUrlSlugs } from "./util";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    private tree: Map<UrlSlug, ResolvedNode>;

    public constructor(public readonly config: PathResolverConfig) {
        this.tree = new Map();
        this.preprocessDefinition();
    }

    public resolveSlug(slug: UrlSlug): ResolvedNode | undefined {
        return this.tree.get(slug);
    }

    public getAllSlugs(): UrlSlug[] {
        return Array.from(this.tree.keys());
    }

    private preprocessDefinition() {
        const navigationConfig = this.config.docsDefinition.config.navigation;
        if (isVersionedNavigationConfig(navigationConfig)) {
            navigationConfig.versions.forEach((versionConfigData, versionIndex) => {
                const versionNode: ResolvedNode.Version = {
                    type: "version",
                    slug: versionConfigData.urlSlug,
                    version: {
                        id: versionConfigData.version,
                        slug: versionConfigData.urlSlug,
                    },
                    children: new Map(),
                };
                this.tree.set(joinUrlSlugs(versionNode.slug), versionNode);
                if (isUnversionedTabbedNavigationConfig(versionConfigData.config)) {
                    versionConfigData.config.tabs.forEach((tab, tabIndex) => {
                        const tabNode: ResolvedNode.Tab = {
                            type: "tab",
                            slug: tab.urlSlug,
                            version: {
                                id: versionConfigData.version,
                                slug: versionConfigData.urlSlug,
                            },
                            children: new Map(),
                        };
                        this.tree.set(joinUrlSlugs(versionNode.slug, tabNode.slug), tabNode);
                        versionNode.children.set(tabNode.slug, tabNode);
                        this.deepTraverseItems(
                            tab.items,
                            {
                                id: versionConfigData.version,
                                slug: versionConfigData.urlSlug,
                            },
                            {
                                slug: tab.urlSlug,
                                index: tabIndex,
                            },
                            [versionConfigData.urlSlug, tab.urlSlug]
                        );
                        if (versionIndex === 0) {
                            // Special handling for default version
                            this.tree.set(joinUrlSlugs(tabNode.slug), tabNode);
                            this.deepTraverseItems(
                                tab.items,
                                {
                                    id: versionConfigData.version,
                                    slug: versionConfigData.urlSlug,
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
                        versionConfigData.config.items,
                        {
                            id: versionConfigData.version,
                            slug: versionConfigData.urlSlug,
                        },
                        null,
                        [versionConfigData.urlSlug]
                    );
                    if (versionIndex === 0) {
                        // Special handling for default version
                        this.deepTraverseItems(
                            versionConfigData.config.items,
                            {
                                id: versionConfigData.version,
                                slug: versionConfigData.urlSlug,
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
                    const tabNode: ResolvedNode.Tab = {
                        type: "tab",
                        slug: tab.urlSlug,
                        version: null,
                        children: new Map(),
                    };
                    this.tree.set(tabNode.slug, tabNode);
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
                    this.tree.set(joinUrlSlugs(...slugs, node.slug), node);
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
                    this.tree.set(joinUrlSlugs(...slugs, node.slug), node);
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
                    this.tree.set(joinUrlSlugs(...slugs, node.slug), node);
                    this.deepTraverseItems(item.items, version, tab, [...slugs, node.slug]);
                },
                _other: noop,
            });
        });
    }
}
