import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { kebabCase, last } from "lodash-es";
import urljoin from "url-join";
import { APIV1Read, DocsV1Read, visitReadNavigationConfig, visitUnversionedReadNavigationConfig } from "../../client";
import { FernNavigation } from "../generated";
import { followRedirect, followRedirects } from "../utils";
import { convertAvailability } from "../utils/convertAvailability";
import { createSlug } from "../utils/createSlug";
import { ApiReferenceNavigationConverter } from "./ApiReferenceNavigationConverter";
import { ChangelogNavigationConverter } from "./ChangelogConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";

export class NavigationConfigConverter {
    private constructor(
        private config: DocsV1Read.NavigationConfig,
        private apis: Record<string, APIV1Read.ApiDefinition>,
        private basePath: string | undefined,
    ) {}

    public static convert(
        config: DocsV1Read.NavigationConfig,
        apis: Record<string, APIV1Read.ApiDefinition>,
        basePath: string | undefined,
    ): FernNavigation.RootNode {
        return new NavigationConfigConverter(config, apis, basePath).convert();
    }

    #idgen = new NodeIdGenerator();
    private convert(): FernNavigation.RootNode {
        return this.#idgen.with("root", (id) => {
            const slug = FernNavigation.Slug(
                this.basePath != null
                    ? urljoin(
                          this.basePath
                              .trim()
                              .split("/")
                              .filter((b) => b.length > 0),
                      )
                    : "",
            );
            const child = visitReadNavigationConfig<FernNavigation.RootChild>(this.config, {
                versioned: (versioned) => this.convertVersionedNavigationConfig(versioned, slug),
                unversioned: (unversioned) => this.convertUnversionedNavigationConfig(unversioned, slug, slug),
            });
            const pointsTo = followRedirect(child);
            return {
                id,
                type: "root",
                child,
                slug,

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
        baseSlug: FernNavigation.Slug,
    ): FernNavigation.VersionedNode {
        return this.#idgen.with("", (id) => {
            const children: FernNavigation.VersionNode[] = [];
            versioned.versions.forEach((version, idx) => {
                if (idx === 0) {
                    children.push(
                        this.#idgen.with("*", (id) => {
                            const child = this.convertUnversionedNavigationConfig(version.config, baseSlug, baseSlug);
                            const pointsTo = followRedirect(child);
                            return {
                                id,
                                type: "version",
                                title: version.version,
                                versionId: FernNavigation.VersionId(version.urlSlug),
                                slug: baseSlug,
                                icon: undefined,
                                hidden: undefined,
                                child,
                                availability: convertAvailability(version.availability),
                                pointsTo,
                            };
                        }),
                    );
                }
                const slug = createSlug(baseSlug, baseSlug, version);
                children.push(
                    this.#idgen.with(version.urlSlug, (id) => {
                        const child = this.convertUnversionedNavigationConfig(version.config, slug, slug);
                        const pointsTo = followRedirect(child);
                        return {
                            id,
                            type: "version",
                            title: version.version,
                            versionId: FernNavigation.VersionId(version.urlSlug),
                            slug,
                            icon: undefined,
                            hidden: idx === 0, // hidden from the version selector
                            child,
                            availability: convertAvailability(version.availability),
                            pointsTo,
                        };
                    }),
                );
            });
            return { id, type: "versioned", children };
        });
    }

    private convertUnversionedNavigationConfig(
        unversioned: DocsV1Read.UnversionedNavigationConfig,
        baseSlug: string,
        parentSlug: string,
    ): FernNavigation.VersionChild {
        return this.#idgen.with("uv", (id) => {
            return visitUnversionedReadNavigationConfig<FernNavigation.VersionChild>(unversioned, {
                tabbed: (tabbed) => ({
                    id,
                    type: "tabbed",
                    children: tabbed.tabs.map((tab): FernNavigation.TabChild => {
                        if (tab.type === "group" || (tab.type == null && Array.isArray(tab.items))) {
                            return this.#idgen.with(tab.urlSlug, (id) => {
                                const slug = createSlug(baseSlug, parentSlug, tab);
                                const child: FernNavigation.SidebarRootNode = this.#idgen.with(tab.urlSlug, (id) => ({
                                    id,
                                    type: "sidebarRoot",
                                    children: this.groupSidebarRootChildren(
                                        tab.items.map((item) => this.convertNavigationItem(item, baseSlug, slug)),
                                    ),
                                }));
                                const pointsTo = followRedirect(child);
                                return {
                                    id,
                                    type: "tab",
                                    title: tab.title,
                                    slug,
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
                            return ChangelogNavigationConverter.convert(tab, baseSlug, parentSlug, this.#idgen);
                        } else {
                            assertNever(tab as never);
                        }
                    }),
                }),
                untabbed: (untabbed) => ({
                    id,
                    type: "sidebarRoot",
                    children: this.groupSidebarRootChildren(
                        untabbed.items.map((item) => this.convertNavigationItem(item, baseSlug, parentSlug)),
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

            const lastChild = last(grouped);
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
        baseSlug: string,
        parentSlug: string,
    ): FernNavigation.NavigationChild {
        return visitDiscriminatedUnion(item, "type")._visit<FernNavigation.NavigationChild>({
            page: (page) =>
                this.#idgen.with(page.urlSlug, (id) => ({
                    id,
                    type: "page",
                    pageId: FernNavigation.PageId(page.id),
                    title: page.title,
                    slug: createSlug(baseSlug, parentSlug, page),
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
                    const slug = createSlug(baseSlug, parentSlug, section);

                    const children = section.items.map((item) => this.convertNavigationItem(item, baseSlug, slug));
                    const pointsTo = followRedirects(children);
                    return {
                        id,
                        type: "section",
                        collapsed: section.collapsed,
                        title: section.title,
                        icon: section.icon,
                        hidden: section.hidden,
                        overviewPageId: undefined,
                        slug,
                        children,
                        pointsTo,
                    };
                }),
            api: (apiSection) => {
                const api = this.apis[apiSection.api];
                if (api == null) {
                    throw new Error(`API ${apiSection.api} not found}`);
                }
                return ApiReferenceNavigationConverter.convert(apiSection, api, baseSlug, parentSlug, this.#idgen);
            },
            changelog: (changelog) =>
                ChangelogNavigationConverter.convert(changelog, baseSlug, parentSlug, this.#idgen),
            _other: (value) => assertNever(value as never),
        });
    }
}
