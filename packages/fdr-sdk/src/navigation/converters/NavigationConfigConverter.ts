import { APIV1Read, DocsV1Read, visitReadNavigationConfig, visitUnversionedReadNavigationConfig } from "../../client";
import { assertNever, kebabCase, visitDiscriminatedUnion } from "../../utils";
import { FernNavigation } from "../generated";
import { hasMetadata } from "../types";
import { followRedirect, followRedirects, traverseNavigation } from "../utils";
import { convertAvailability } from "../utils/convertAvailability";
import { getNoIndexFromFrontmatter } from "../utils/getNoIndexFromFrontmatter";
import { toDefaultSlug } from "../utils/pruneVersionNode";
import { ApiReferenceNavigationConverter } from "./ApiReferenceNavigationConverter";
import { ChangelogNavigationConverter } from "./ChangelogConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { SlugGenerator } from "./SlugGenerator";

export class NavigationConfigConverter {
    private constructor(
        private title: string | undefined,
        private config: DocsV1Read.NavigationConfig,
        private pages: Record<string, DocsV1Read.PageContent>,
        private apis: Record<string, APIV1Read.ApiDefinition>,
        private basePath: string | undefined,
        private lexicographic?: boolean,
    ) {}

    public static convert(
        title: string | undefined,
        config: DocsV1Read.NavigationConfig,
        pages: Record<string, DocsV1Read.PageContent>,
        apis: Record<string, APIV1Read.ApiDefinition>,
        basePath: string | undefined,
        lexicographic?: boolean,
    ): FernNavigation.RootNode {
        return new NavigationConfigConverter(title, config, pages, apis, basePath, lexicographic).convert();
    }

    #idgen = new NodeIdGenerator();
    private convert(): FernNavigation.RootNode {
        return this.#idgen.with("root", (id) => {
            const baseSlug = SlugGenerator.init(this.basePath ?? "");
            const child = visitReadNavigationConfig<FernNavigation.RootChild>(this.config, {
                versioned: (versioned) => this.convertVersionedNavigationConfig(versioned, baseSlug),
                unversioned: (unversioned) => this.convertUnversionedNavigationConfig(unversioned, baseSlug),
            });
            let pointsTo = followRedirect(child);
            if (pointsTo != null && child.type === "versioned") {
                const defaultVersion = child.children.find((v) => v.default);
                if (defaultVersion != null) {
                    pointsTo = toDefaultSlug(pointsTo, baseSlug.get(), defaultVersion.slug);
                }
            }

            const toRet: FernNavigation.RootNode = {
                id,
                type: "root",
                version: "v1",
                child,
                slug: baseSlug.get(),

                title: this.title ?? "Documentation",
                hidden: false,
                icon: undefined,
                pointsTo,
            };

            // tag all children of hidden nodes as hidden
            traverseNavigation(toRet, (node, _index, parents) => {
                if (hasMetadata(node) && parents.some((p) => hasMetadata(p) && p.hidden === true)) {
                    node.hidden = true;
                }
            });

            return toRet;
        });
    }

    private convertVersionedNavigationConfig(
        versioned: DocsV1Read.VersionedNavigationConfig,
        parentSlug: SlugGenerator,
    ): FernNavigation.VersionedNode {
        return this.#idgen.with("", (id) => {
            const children = versioned.versions.map((version, idx): FernNavigation.VersionNode => {
                const slug = parentSlug.setVersionSlug(version.urlSlug);
                return this.#idgen.with(version.urlSlug, (id): FernNavigation.VersionNode => {
                    const child = this.convertUnversionedNavigationConfig(version.config, slug);
                    const pointsTo = followRedirect(child);
                    return {
                        id,
                        type: "version",
                        title: version.version,
                        default: idx === 0,
                        // the versionId must match `indexSegmentsByVersionId`
                        versionId: FernNavigation.VersionId(version.version),
                        slug: slug.get(),
                        icon: undefined,
                        hidden: false,
                        child: child.child,
                        availability: convertAvailability(version.availability),
                        pointsTo,
                        landingPage: child.landingPage,
                    };
                });
            });
            return { id, type: "versioned", children };
        });
    }

    private convertUnversionedNavigationConfig(
        unversioned: DocsV1Read.UnversionedNavigationConfig,
        parentSlug: SlugGenerator,
    ): FernNavigation.UnversionedNode {
        return this.#idgen.with("uv", (id) => {
            const child = visitUnversionedReadNavigationConfig<FernNavigation.VersionChild>(unversioned, {
                tabbed: (tabbed) => ({
                    id,
                    type: "tabbed",
                    children: tabbed.tabs.map((tab): FernNavigation.TabChild => {
                        if (tab.type === "group" || tab.type == null) {
                            return this.#idgen.with(tab.urlSlug, (id) => {
                                const slug = parentSlug.apply(tab);
                                const child: FernNavigation.SidebarRootNode = this.#idgen.with(tab.urlSlug, (id) => ({
                                    id,
                                    type: "sidebarRoot",
                                    children: this.groupSidebarRootChildren(
                                        tab.items.map((item) => this.convertNavigationItem(item, slug)),
                                    ),
                                }));
                                const pointsTo = followRedirect(child);
                                return {
                                    id,
                                    type: "tab",
                                    title: tab.title,
                                    slug: slug.get(),
                                    icon: tab.icon,
                                    hidden: tab.hidden,
                                    child,
                                    pointsTo,
                                };
                            });
                        } else if (tab.type === "link") {
                            return this.#idgen.with("link", (id) => ({
                                id,
                                type: "link",
                                title: tab.title,
                                url: FernNavigation.Url(tab.url),
                                icon: tab.icon,
                            }));
                        } else if (tab.type === "changelog") {
                            const slug = parentSlug.apply(tab);
                            return ChangelogNavigationConverter.convert(tab, slug, this.#idgen, this.pages);
                        } else if (tab.type === "changelogV3") {
                            return tab.node as unknown as FernNavigation.ChangelogNode;
                        } else {
                            assertNever(tab as never);
                        }
                    }),
                }),
                untabbed: (untabbed) => ({
                    id,
                    type: "sidebarRoot",
                    children: this.groupSidebarRootChildren(
                        untabbed.items.map((item) => this.convertNavigationItem(item, parentSlug)),
                    ),
                }),
            });
            return {
                id,
                type: "unversioned",
                child,
                landingPage: this.#idgen.with("landing-page", (id) => {
                    if (unversioned.landingPage == null) {
                        return undefined;
                    }

                    const pageId = FernNavigation.PageId(unversioned.landingPage.id);
                    return {
                        id,
                        type: "landingPage",
                        pageId,
                        title: unversioned.landingPage.title,
                        slug: parentSlug.apply(unversioned.landingPage).get(),
                        icon: unversioned.landingPage.icon,
                        hidden: unversioned.landingPage.hidden,
                        noindex: getNoIndexFromFrontmatter(this.pages, pageId),
                    };
                }),
            };
        });
    }

    private groupSidebarRootChildren(children: FernNavigation.NavigationChild[]): FernNavigation.SidebarRootChild[] {
        const grouped: FernNavigation.SidebarRootChild[] = [];
        children.forEach((child) => {
            if (child.type === "apiReference") {
                grouped.push(child);
                return;
            }

            if (child.type === "section" && !child.collapsed) {
                grouped.push(child);
                return;
            }

            const lastChild = grouped.length > 0 ? grouped[grouped.length - 1] : undefined;
            let sidebarGroup: FernNavigation.SidebarGroupNode;
            if (lastChild?.type === "sidebarGroup") {
                sidebarGroup = lastChild;
            } else {
                sidebarGroup = this.#idgen.with("group", (id) => ({
                    id,
                    type: "sidebarGroup",
                    children: [],
                }));
                grouped.push(sidebarGroup);
            }

            sidebarGroup.children.push(child);
        });
        return grouped;
    }

    private convertNavigationItem(
        item: DocsV1Read.NavigationItem,
        parentSlug: SlugGenerator,
    ): FernNavigation.NavigationChild {
        return visitDiscriminatedUnion(item, "type")._visit<FernNavigation.NavigationChild>({
            page: (page) =>
                this.#idgen.with(page.urlSlug, (id) => {
                    const pageId = FernNavigation.PageId(page.id);
                    return {
                        id,
                        type: "page",
                        pageId,
                        title: page.title,
                        slug: parentSlug.apply(page).get(),
                        icon: page.icon,
                        hidden: page.hidden,
                        noindex: getNoIndexFromFrontmatter(this.pages, pageId),
                    };
                }),
            link: (link) =>
                this.#idgen.with(kebabCase(link.title), (id) => ({
                    id,
                    type: "link",
                    title: link.title,
                    url: FernNavigation.Url(link.url),
                    icon: link.icon,
                })),
            section: (section) =>
                this.#idgen.with(section.urlSlug, (id) => {
                    const slug = parentSlug.apply(section);

                    const children = section.items.map((item) => this.convertNavigationItem(item, slug));
                    const pointsTo = followRedirects(children);
                    const overviewPageId =
                        section.overviewPageId != null ? FernNavigation.PageId(section.overviewPageId) : undefined;
                    const noindex = getNoIndexFromFrontmatter(this.pages, overviewPageId);
                    return {
                        id,
                        type: "section",
                        collapsed: section.collapsed,
                        title: section.title,
                        icon: section.icon,
                        hidden: section.hidden,
                        overviewPageId,
                        noindex,
                        slug: slug.get(),
                        children,
                        pointsTo,
                    };
                }),
            api: (apiSection) => {
                const api = this.apis[apiSection.api];
                if (api == null) {
                    throw new Error(`API ${apiSection.api} not found}`);
                }
                return ApiReferenceNavigationConverter.convert(
                    apiSection,
                    api,
                    this.pages,
                    parentSlug,
                    this.#idgen,
                    this.lexicographic,
                );
            },
            changelog: (changelog) =>
                ChangelogNavigationConverter.convert(changelog, parentSlug, this.#idgen, this.pages),
            // Note: apiSection.node is imported from `navigation`, and is guaranteed to be a FernNavigation.ApiReferenceNode
            apiV2: (apiSection) => apiSection.node as unknown as FernNavigation.ApiReferenceNode,
            changelogV3: (changelog) => changelog.node as unknown as FernNavigation.ChangelogNode,
            _other: (value) => assertNever(value as never),
        });
    }
}
