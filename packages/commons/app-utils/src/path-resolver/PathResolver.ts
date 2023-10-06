import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../fern";
import type { ResolvedNode, UrlSlug } from "./types";

function joinUrlSlugs(...parts: string[]): string {
    return parts.reduce((a, b) => {
        if (a === "") {
            return b;
        }
        return `${a}/${b}`;
    });
}

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
            navigationConfig.versions.forEach((v, versionIndex) => {
                const versionNode: ResolvedNode.Version = {
                    type: "version",
                    slug: v.urlSlug,
                    versionId: v.version,
                    children: new Map(),
                };
                this.tree.set(joinUrlSlugs(versionNode.slug), versionNode);
                if (isUnversionedTabbedNavigationConfig(v.config)) {
                    v.config.tabs.forEach((t) => {
                        const tabNode: ResolvedNode.Tab = {
                            type: "tab",
                            slug: t.urlSlug,
                            versionId: v.version,
                            children: new Map(),
                        };
                        this.tree.set(joinUrlSlugs(versionNode.slug, tabNode.slug), tabNode);
                        versionNode.children.set(tabNode.slug, tabNode);
                        this.deepTraverseItems(t.items, v.version, t.urlSlug, [v.urlSlug, t.urlSlug]);
                        if (versionIndex === 0) {
                            // Special handling for default version
                            this.tree.set(joinUrlSlugs(tabNode.slug), tabNode);
                            this.deepTraverseItems(t.items, v.version, t.urlSlug, [t.urlSlug]);
                        }
                    });
                } else {
                    this.deepTraverseItems(v.config.items, v.version, null, [v.urlSlug]);
                    if (versionIndex === 0) {
                        // Special handling for default version
                        this.deepTraverseItems(v.config.items, v.version, null, []);
                    }
                }
            });
        } else {
            if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
                navigationConfig.tabs.forEach((t) => {
                    const tabNode: ResolvedNode.Tab = {
                        type: "tab",
                        slug: t.urlSlug,
                        versionId: null,
                        children: new Map(),
                    };
                    this.tree.set(tabNode.slug, tabNode);
                    this.deepTraverseItems(t.items, null, t.urlSlug, [t.urlSlug]);
                });
            } else {
                this.deepTraverseItems(navigationConfig.items, null, null, []);
            }
        }
    }

    private deepTraverseItems(
        navigationItems: FernRegistryDocsRead.NavigationItem[],
        versionId: string | null,
        tabSlug: string | null,
        slugs: string[]
    ) {
        navigationItems.forEach((item) => {
            visitDiscriminatedUnion(item, "type")._visit({
                page: (item) => {
                    const node: ResolvedNode.Page = {
                        type: "page",
                        page: item,
                        slug: item.urlSlug,
                        versionId,
                        tabSlug,
                    };
                    this.tree.set(joinUrlSlugs(...slugs, node.slug), node);
                },
                api: (item) => {
                    const node: ResolvedNode.ApiSection = {
                        type: "api-section",
                        section: item,
                        children: new Map(),
                        slug: item.urlSlug,
                        versionId,
                        tabSlug,
                    };
                    this.tree.set(joinUrlSlugs(...slugs, node.slug), node);
                },
                section: (item) => {
                    const node: ResolvedNode.DocsSection = {
                        type: "docs-section",
                        section: item,
                        children: new Map(),
                        slug: item.urlSlug,
                        versionId,
                        tabSlug,
                    };
                    this.tree.set(joinUrlSlugs(...slugs, node.slug), node);
                    this.deepTraverseItems(item.items, versionId, tabSlug, [...slugs, node.slug]);
                },
                _other: noop,
            });
        });
    }
}
