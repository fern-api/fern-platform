import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last } from "lodash-es";
import { APIV1Read, DocsV1Read, visitReadNavigationConfig, visitUnversionedReadNavigationConfig } from "../../client";
import { FernNavigation } from "../generated";
import { convertAvailability } from "../utils/convertAvailability";
import { createSlug } from "../utils/createSlug";
import { ApiReferenceNavigationConverter } from "./ApiReferenceNavigationConverter";
import { ChangelogNavigationConverter } from "./ChangelogConverter";

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

    private convert(): FernNavigation.RootNode {
        const slug =
            this.basePath != null
                ? this.basePath
                      .trim()
                      .split("/")
                      .filter((b) => b.length > 0)
                : [];
        return {
            type: "root",
            child: visitReadNavigationConfig<FernNavigation.RootChild>(this.config, {
                versioned: (versioned) => this.convertVersionedNavigationConfig(versioned, slug),
                unversioned: (unversioned) => this.convertUnversionedNavigationConfig(unversioned, slug, slug),
            }),
            slug,

            // the following don't matter:
            title: "Fern Docs",
            hidden: false,
            icon: undefined,
        };
    }

    private convertVersionedNavigationConfig(
        versioned: DocsV1Read.VersionedNavigationConfig,
        baseSlug: string[],
    ): FernNavigation.VersionedNode {
        const children: FernNavigation.VersionNode[] = [];
        versioned.versions.forEach((version, idx) => {
            if (idx === 0) {
                children.push({
                    type: "version",
                    title: version.version,
                    versionId: FernNavigation.VersionId(version.urlSlug),
                    slug: baseSlug,
                    icon: undefined,
                    hidden: undefined,
                    child: this.convertUnversionedNavigationConfig(version.config, baseSlug, baseSlug),
                    availability: convertAvailability(version.availability),
                });
            }
            const slug = [...baseSlug, version.urlSlug];
            children.push({
                type: "version",
                title: version.version,
                versionId: FernNavigation.VersionId(version.urlSlug),
                slug,
                icon: undefined,
                hidden: idx === 0, // hidden from the version selector
                child: this.convertUnversionedNavigationConfig(version.config, slug, slug),
                availability: convertAvailability(version.availability),
            });
        });
        return { type: "versioned", children };
    }

    private convertUnversionedNavigationConfig(
        unversioned: DocsV1Read.UnversionedNavigationConfig,
        baseSlug: string[],
        parentSlug: string[],
    ): FernNavigation.VersionChild {
        return visitUnversionedReadNavigationConfig<FernNavigation.VersionChild>(unversioned, {
            tabbed: (tabbed) => ({
                type: "tabbed",
                children: tabbed.tabs.map((tab): FernNavigation.TabChild => {
                    if (tab.type === "group" || (tab.type == null && Array.isArray(tab.items))) {
                        const slug = createSlug(baseSlug, parentSlug, tab);
                        return {
                            type: "tab",
                            title: tab.title,
                            slug,
                            icon: tab.icon,
                            hidden: false,
                            child: {
                                type: "sidebarRoot",
                                children: this.groupSidebarRootChildren(
                                    tab.items.map((item) => this.convertNavigationItem(item, baseSlug, slug)),
                                ),
                            },
                        };
                    } else if (tab.type === "link") {
                        return {
                            type: "link",
                            title: tab.title,
                            url: FernNavigation.Url(tab.url),
                            icon: tab.icon,
                        };
                    } else if (tab.type === "changelog") {
                        return ChangelogNavigationConverter.convert(tab, baseSlug, parentSlug);
                    } else {
                        assertNever(tab as never);
                    }
                }),
            }),
            untabbed: (untabbed) => ({
                type: "sidebarRoot",
                children: this.groupSidebarRootChildren(
                    untabbed.items.map((item) => this.convertNavigationItem(item, baseSlug, parentSlug)),
                ),
            }),
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
                sidebarGroup = {
                    type: "sidebarGroup",
                    children: [],
                };
                grouped.push(sidebarGroup);
            }

            sidebarGroup.children.push(child);
        });
        return grouped;
    }

    private convertNavigationItem(
        item: DocsV1Read.NavigationItem,
        baseSlug: string[],
        parentSlug: string[],
    ): FernNavigation.NavigationChild {
        return visitDiscriminatedUnion(item, "type")._visit<FernNavigation.NavigationChild>({
            page: (page) => ({
                type: "page",
                pageId: FernNavigation.PageId(page.id),
                title: page.title,
                slug: createSlug(baseSlug, parentSlug, page),
                icon: page.icon,
                hidden: page.hidden,
            }),
            link: (link) => ({
                type: "link",
                title: link.title,
                url: FernNavigation.Url(link.url),
                icon: link.icon,
            }),
            section: (section) => {
                const slug = createSlug(baseSlug, parentSlug, section);
                return {
                    type: "section",
                    collapsed: section.collapsed,
                    title: section.title,
                    icon: section.icon,
                    hidden: section.hidden,
                    overviewPageId: undefined,
                    slug,
                    children: section.items.map((item) => this.convertNavigationItem(item, baseSlug, slug)),
                };
            },
            api: (apiSection) => ApiReferenceNavigationConverter.convert(apiSection, this.apis, baseSlug, parentSlug),
            changelog: (changelog) => ChangelogNavigationConverter.convert(changelog, baseSlug, parentSlug),
            _other: (value) => assertNever(value as never),
        });
    }
}
