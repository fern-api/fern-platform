import assertNever from "@fern-api/ui-core-utils/assertNever";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { kebabCase } from "es-toolkit/string";
import { FernNavigation } from "../../../..";
import type { APIV1Read, DocsV1Read } from "../../../../client/types";
import {
    visitReadNavigationConfig,
    visitUnversionedReadNavigationConfig,
} from "../../../../client/visitReadNavigationConfig";
import { ApiReferenceNavigationConverter } from "./ApiReferenceNavigationConverter";
import { ChangelogNavigationConverter } from "./ChangelogConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { SlugGenerator } from "./SlugGenerator";

export class NavigationConfigConverter {
    private constructor(
        private title: string | undefined,
        private config: DocsV1Read.NavigationConfig,
        private fullSlugMap: Record<FernNavigation.V1.PageId, FernNavigation.V1.Slug>,
        private noindexMap: Record<FernNavigation.V1.PageId, boolean>,
        private apis: Record<string, APIV1Read.ApiDefinition>,
        private basePath: string | undefined,
        private lexicographic?: boolean,
        private disableEndpointPairs?: boolean,
        private paginated?: boolean,
    ) {}

    public static convert(
        title: string | undefined,
        config: DocsV1Read.NavigationConfig,
        fullSlugMap: Record<FernNavigation.V1.PageId, FernNavigation.V1.Slug>,
        noindexMap: Record<FernNavigation.V1.PageId, boolean>,
        apis: Record<string, APIV1Read.ApiDefinition>,
        basePath: string | undefined,
        lexicographic?: boolean,
        disableEndpointPairs?: boolean,
        paginated?: boolean,
    ): FernNavigation.V1.RootNode {
        return new NavigationConfigConverter(
            title,
            config,
            fullSlugMap,
            noindexMap,
            apis,
            basePath,
            lexicographic,
            disableEndpointPairs,
            paginated,
        ).convert();
    }

    #idgen = new NodeIdGenerator();
    private convert(): FernNavigation.V1.RootNode {
        return this.#idgen.with("root", (id) => {
            const baseSlug = SlugGenerator.init(this.basePath ?? "");
            const child = visitReadNavigationConfig<FernNavigation.V1.RootChild>(this.config, {
                versioned: (versioned) => this.convertVersionedNavigationConfig(versioned, baseSlug),
                unversioned: (unversioned) => this.convertUnversionedNavigationConfig(unversioned, baseSlug),
            });
            let pointsTo = FernNavigation.V1.followRedirect(child);
            if (pointsTo != null && child.type === "versioned") {
                const defaultVersion = child.children.find((v) => v.default);
                if (defaultVersion != null) {
                    pointsTo = FernNavigation.V1.toDefaultSlug(pointsTo, baseSlug.get(), defaultVersion.slug);
                }
            }

            const toRet: FernNavigation.V1.RootNode = {
                id,
                type: "root",
                version: "v1",
                child,
                slug: baseSlug.get(),

                title: this.title ?? "Documentation",
                hidden: false,
                icon: undefined,
                pointsTo,
                authed: undefined,
                viewers: undefined,
            };

            // tag all children of hidden nodes as hidden
            FernNavigation.V1.traverseDF(toRet, (node, parents) => {
                if (
                    FernNavigation.V1.hasMetadata(node) &&
                    parents.some((p) => FernNavigation.V1.hasMetadata(p) && p.hidden === true)
                ) {
                    node.hidden = true;
                }
            });

            return toRet;
        });
    }

    private convertVersionedNavigationConfig(
        versioned: DocsV1Read.VersionedNavigationConfig,
        parentSlug: SlugGenerator,
    ): FernNavigation.V1.VersionedNode {
        return this.#idgen.with("", (id) => {
            const children = versioned.versions.map((version, idx): FernNavigation.V1.VersionNode => {
                const slug = parentSlug.setVersionSlug(version.urlSlug);
                return this.#idgen.with(version.urlSlug, (id): FernNavigation.V1.VersionNode => {
                    const child = this.convertUnversionedNavigationConfig(version.config, slug);
                    const pointsTo = FernNavigation.V1.followRedirect(child);
                    return {
                        id,
                        type: "version",
                        title: version.version,
                        default: idx === 0,
                        // the versionId must match `indexSegmentsByVersionId`
                        versionId: FernNavigation.V1.VersionId(version.version),
                        slug: slug.get(),
                        icon: undefined,
                        hidden: false,
                        child: child.child,
                        availability: FernNavigation.V1.convertAvailability(version.availability),
                        pointsTo,
                        landingPage: child.landingPage,
                        authed: undefined,
                        viewers: undefined,
                    };
                });
            });
            return { id, type: "versioned", children };
        });
    }

    private convertUnversionedNavigationConfig(
        unversioned: DocsV1Read.UnversionedNavigationConfig,
        parentSlug: SlugGenerator,
    ): FernNavigation.V1.UnversionedNode {
        return this.#idgen.with("uv", (id) => {
            const child = visitUnversionedReadNavigationConfig<FernNavigation.V1.VersionChild>(unversioned, {
                tabbed: (tabbed) => ({
                    id,
                    type: "tabbed",
                    children: tabbed.tabs.map((tab): FernNavigation.V1.TabChild => {
                        if (tab.type === "group" || tab.type == null) {
                            return this.#idgen.with(tab.urlSlug, (id) => {
                                const slug = parentSlug.apply(tab);
                                const child: FernNavigation.V1.SidebarRootNode = this.#idgen.with(
                                    tab.urlSlug,
                                    (id) => ({
                                        id,
                                        type: "sidebarRoot",
                                        children: this.groupSidebarRootChildren(
                                            tab.items.map((item) => this.convertNavigationItem(item, slug)),
                                        ),
                                    }),
                                );
                                const pointsTo = FernNavigation.V1.followRedirect(child);
                                return {
                                    id,
                                    type: "tab",
                                    title: tab.title,
                                    slug: slug.get(),
                                    icon: tab.icon,
                                    hidden: tab.hidden,
                                    child,
                                    pointsTo,
                                    authed: undefined,
                                    viewers: undefined,
                                };
                            });
                        } else if (tab.type === "link") {
                            return this.#idgen.with("link", (id) => ({
                                id,
                                type: "link",
                                title: tab.title,
                                url: FernNavigation.V1.Url(tab.url),
                                icon: tab.icon,
                            }));
                        } else if (tab.type === "changelog") {
                            const slug = parentSlug.apply(tab);
                            return ChangelogNavigationConverter.convert(
                                tab,
                                this.fullSlugMap,
                                this.noindexMap,
                                slug,
                                this.#idgen,
                            );
                        } else if (tab.type === "changelogV3") {
                            return tab.node as unknown as FernNavigation.V1.ChangelogNode;
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

                    const pageId = FernNavigation.V1.PageId(unversioned.landingPage.id);
                    return {
                        id,
                        type: "landingPage",
                        pageId,
                        title: unversioned.landingPage.title,
                        slug: parentSlug.apply(unversioned.landingPage).get(),
                        icon: unversioned.landingPage.icon,
                        hidden: unversioned.landingPage.hidden,
                        noindex: this.noindexMap[pageId],
                        authed: undefined,
                        viewers: undefined,
                    };
                }),
                authed: undefined,
                viewers: undefined,
            };
        });
    }

    private groupSidebarRootChildren(
        children: FernNavigation.V1.NavigationChild[],
    ): FernNavigation.V1.SidebarRootChild[] {
        const grouped: FernNavigation.V1.SidebarRootChild[] = [];
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
            let sidebarGroup: FernNavigation.V1.SidebarGroupNode;
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
    ): FernNavigation.V1.NavigationChild {
        return visitDiscriminatedUnion(item, "type")._visit<FernNavigation.V1.NavigationChild>({
            page: (page) =>
                this.#idgen.with(page.urlSlug, (id) => {
                    const pageId = FernNavigation.V1.PageId(page.id);
                    return {
                        id,
                        type: "page",
                        pageId,
                        title: page.title,
                        slug: parentSlug.apply(page).get(),
                        icon: page.icon,
                        hidden: page.hidden,
                        noindex: this.noindexMap[pageId],
                        authed: undefined,
                        viewers: undefined,
                    };
                }),
            link: (link) =>
                this.#idgen.with(kebabCase(link.title), (id) => ({
                    id,
                    type: "link",
                    title: link.title,
                    url: FernNavigation.V1.Url(link.url),
                    icon: link.icon,
                })),
            section: (section) =>
                this.#idgen.with(section.urlSlug, (id) => {
                    let slug = parentSlug.apply(section);

                    const children = section.items.map((item) => this.convertNavigationItem(item, slug));
                    const pointsTo = FernNavigation.V1.followRedirects(children);
                    const overviewPageId =
                        section.overviewPageId != null ? FernNavigation.V1.PageId(section.overviewPageId) : undefined;
                    const noindex = overviewPageId != null ? this.noindexMap[overviewPageId] : undefined;

                    const frontmatterSlug = overviewPageId != null ? this.fullSlugMap[overviewPageId] : undefined;
                    if (frontmatterSlug != null) {
                        slug = parentSlug.set(frontmatterSlug);
                    }

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
                        authed: undefined,
                        viewers: undefined,
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
                    this.fullSlugMap,
                    this.noindexMap,
                    parentSlug,
                    this.#idgen,
                    this.lexicographic,
                    this.disableEndpointPairs,
                    this.paginated,
                );
            },
            changelog: (changelog) =>
                ChangelogNavigationConverter.convert(
                    changelog,
                    this.fullSlugMap,
                    this.noindexMap,
                    parentSlug,
                    this.#idgen,
                ),
            // Note: apiSection.node is imported from `navigation`, and is guaranteed to be a FernNavigation.V1.ApiReferenceNode
            apiV2: (apiSection) => {
                const node = apiSection.node as unknown as FernNavigation.V1.ApiReferenceNode;
                if (this.paginated) {
                    node.paginated = true;
                }
                return node;
            },
            changelogV3: (changelog) => changelog.node as unknown as FernNavigation.V1.ChangelogNode,
            _other: (value) => assertNever(value as never),
        });
    }
}
