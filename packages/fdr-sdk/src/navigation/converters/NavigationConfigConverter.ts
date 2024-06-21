import { APIV1Read, DocsV1Read, visitReadNavigationConfig, visitUnversionedReadNavigationConfig } from "../../client";
import { assertNever, kebabCase, visitDiscriminatedUnion } from "../../utils";
import { FernNavigation } from "../generated";
import { followRedirect, followRedirects } from "../utils";
import { convertAvailability } from "../utils/convertAvailability";
import { toDefaultSlug } from "../utils/pruneVersionNode";
import { ApiReferenceNavigationConverter } from "./ApiReferenceNavigationConverter";
import { ChangelogNavigationConverter } from "./ChangelogConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { SlugGenerator } from "./SlugGenerator";

export class NavigationConfigConverter {
    private constructor(
        private config: DocsV1Read.NavigationConfig,
        private apis: Record<string, APIV1Read.ApiDefinition>,
        private basePath: string | undefined,
        private lexicographic?: boolean,
    ) {}

    public static convert(
        config: DocsV1Read.NavigationConfig,
        apis: Record<string, APIV1Read.ApiDefinition>,
        basePath: string | undefined,
        lexicographic?: boolean,
    ): FernNavigation.RootNode {
        return new NavigationConfigConverter(config, apis, basePath, lexicographic).convert();
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
            return {
                id,
                type: "root",
                version: "v1",
                child,
                slug: baseSlug.get(),

                // the following don't matter:
                title: "Fern Docs",
                hidden: false,
                icon: undefined,
                pointsTo,
            };
        });
    }

    private convertVersionedNavigationConfig(
        versioned: DocsV1Read.VersionedNavigationConfig,
        parentSlug: SlugGenerator,
    ): FernNavigation.VersionedNode {
        return this.#idgen.with("", (id) => {
            const children = versioned.versions.map((version, idx): FernNavigation.VersionNode => {
                const slug = parentSlug.setVersionSlug(version.urlSlug);
                return this.#idgen.with(version.urlSlug, (id) => {
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
                        child,
                        availability: convertAvailability(version.availability),
                        pointsTo,
                    };
                });
            });
            return { id, type: "versioned", children };
        });
    }

    private convertUnversionedNavigationConfig(
        unversioned: DocsV1Read.UnversionedNavigationConfig,
        parentSlug: SlugGenerator,
    ): FernNavigation.VersionChild {
        return this.#idgen.with("uv", (id) => {
            return visitUnversionedReadNavigationConfig<FernNavigation.VersionChild>(unversioned, {
                tabbed: (tabbed) => ({
                    id,
                    type: "tabbed",
                    children: tabbed.tabs.map((tab): FernNavigation.TabChild => {
                        if (tab.type === "group") {
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
                                    hidden: false,
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
                            return ChangelogNavigationConverter.convert(tab, slug, this.#idgen);
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
                this.#idgen.with(page.urlSlug, (id) => ({
                    id,
                    type: "page",
                    pageId: FernNavigation.PageId(page.id),
                    title: page.title,
                    slug: parentSlug.apply(page).get(),
                    icon: page.icon,
                    hidden: page.hidden,
                })),
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
                    return {
                        id,
                        type: "section",
                        collapsed: section.collapsed,
                        title: section.title,
                        icon: section.icon,
                        hidden: section.hidden,
                        overviewPageId: undefined,
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
                    parentSlug,
                    this.#idgen,
                    this.lexicographic,
                );
            },
            changelog: (changelog) => ChangelogNavigationConverter.convert(changelog, parentSlug, this.#idgen),
            // Note: apiSection.node is imported from `navigation`, and is guaranteed to be a FernNavigation.ApiReferenceNode
            apiV2: (apiSection) => apiSection.node as unknown as FernNavigation.ApiReferenceNode,
            changelogV3: (changelog) => changelog.node as unknown as FernNavigation.ChangelogNode,
            _other: (value) => assertNever(value as never),
        });
    }
}
