import type { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface FernDocsFrontmatter {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
    excerpt?: SerializedMdxContent;
}

type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

export interface ColorsConfig {
    light: DocsV1Read.ThemeConfig | undefined;
    dark: DocsV1Read.ThemeConfig | undefined;
}

export interface SidebarVersionInfo {
    id: string;
    slug: readonly string[];
    index: number;
    availability: DocsV1Read.VersionAvailability | null;
}

export interface SidebarTab {
    title: string;
    icon: string;
    slug: readonly string[];
}

export interface SidebarNavigationRaw {
    currentTabIndex: number | undefined;
    tabs: SidebarTab[];
    currentVersionIndex: number | undefined;
    versions: SidebarVersionInfo[];
    currentNode: SidebarNodeRaw.VisitableNode;
    sidebarNodes: readonly SidebarNodeRaw[];
}

export interface SidebarNavigation extends Omit<SidebarNavigationRaw, "currentNode" | "sidebarNodes"> {
    sidebarNodes: SidebarNode[];
}

export type SidebarNodeRaw = SidebarNodeRaw.PageGroup | SidebarNodeRaw.ApiSection | SidebarNodeRaw.Section;

export declare namespace SidebarNodeRaw {
    export type VisitableNode = SidebarNodeRaw.Root | SidebarNodeRaw.Page | SidebarNodeRaw.Root["items"][0];
    export type ParentNode = SidebarNodeRaw.Root | SidebarNodeRaw.Root["items"][0];
    export type NavigationNode = SidebarNodeRaw.Root | SidebarNodeRaw.VersionGroup | SidebarNodeRaw.TabGroup;

    export interface Root {
        type: "root";
        slug: readonly string[];
        items: readonly SidebarNodeRaw.VersionGroup[] | readonly SidebarNodeRaw.TabGroup[] | readonly SidebarNodeRaw[];
    }

    export interface VersionGroup extends SidebarVersionInfo {
        type: "versionGroup";
        items: readonly SidebarNodeRaw.TabGroup[] | readonly SidebarNodeRaw[];
    }

    export interface TabGroup extends SidebarTab {
        type: "tabGroup";
        items: readonly SidebarNodeRaw[];
    }

    export interface PageGroup {
        type: "pageGroup";
        slug: readonly string[];
        pages: (Page | Link | Section)[];
    }

    export interface ChangelogPage extends Page {
        pageType: "changelog";
        pageId: string | undefined;
        items: {
            date: string;
            pageId: string;
        }[];
    }

    export interface ApiSection {
        type: "apiSection";
        api: FdrAPI.ApiId;
        id: string;
        title: string;
        slug: readonly string[];
        items: ApiPageOrSubpackage[];
        artifacts: DocsV1Read.ApiArtifacts | undefined;
        showErrors: boolean;
        changelog: ChangelogPage | undefined;
        description: string | undefined;
        icon: string | undefined;
        hidden: boolean;
    }

    export interface Section {
        type: "section";
        title: string;
        slug: readonly string[];
        items: SidebarNodeRaw[];
        icon: string | undefined;
        hidden: boolean;
    }

    export interface Page {
        type: "page";
        id: string;
        slug: string[];
        title: string;
        description: string | undefined;
        icon: string | undefined;
        hidden: boolean;
    }

    export interface Link {
        type: "link";
        title: string;
        url: string;
        icon: string | undefined;
    }

    export interface WebSocketPage extends Page {
        api: FdrAPI.ApiId;
        apiType: "websocket";
    }

    export interface WebhookPage extends Page {
        api: FdrAPI.ApiId;
        apiType: "webhook";
    }

    export interface EndpointPage extends Page {
        api: FdrAPI.ApiId;
        apiType: "endpoint";
        method: APIV1Read.HttpMethod;
        stream?: boolean;
    }

    export interface SubpackageSection extends ApiSection {
        apiType: "subpackage";
    }

    export type ApiPage = WebSocketPage | WebhookPage | EndpointPage;

    export type ApiPageOrSubpackage = ApiPage | SubpackageSection;
}

export type SidebarNode = SidebarNode.PageGroup | SidebarNode.ApiSection | SidebarNode.Section;

export declare namespace SidebarNode {
    export interface Root {
        type: "root";
        slug: readonly string[];
        items: readonly VersionGroup[] | readonly TabGroup[] | readonly SidebarNode[];
    }

    export interface VersionGroup extends Omit<SidebarNodeRaw.VersionGroup, "items"> {
        items: readonly TabGroup[] | readonly SidebarNode[];
    }

    export interface TabGroup extends Omit<SidebarNodeRaw.TabGroup, "items"> {
        items: readonly SidebarNode[];
    }

    export interface PageGroup extends Omit<SidebarNodeRaw.PageGroup, "pages"> {
        pages: (Page | SidebarNodeRaw.Link | Section)[];
    }

    export interface ChangelogPage extends Page, Omit<SidebarNodeRaw.ChangelogPage, keyof Page> {}

    export interface ApiSection extends Omit<SidebarNodeRaw.ApiSection, "items" | "changelog" | "description"> {
        items: ApiPageOrSubpackage[];
        changelog: ChangelogPage | undefined;
        description: SerializedMdxContent | undefined;
    }

    export interface Section extends Omit<SidebarNodeRaw.Section, "items"> {
        items: SidebarNode[];
    }

    export interface Page extends Omit<SidebarNodeRaw.Page, "description"> {
        description: SerializedMdxContent | undefined;
    }

    export interface WebSocketPage extends Page {
        api: FdrAPI.ApiId;
        apiType: "websocket";
    }

    export interface WebhookPage extends Page {
        api: FdrAPI.ApiId;
        apiType: "webhook";
    }

    export interface EndpointPage extends Page {
        api: FdrAPI.ApiId;
        apiType: "endpoint";
        method: APIV1Read.HttpMethod;
        stream?: boolean;
    }

    export interface SubpackageSection extends ApiSection {
        apiType: "subpackage";
    }

    export type ApiPage = WebSocketPage | WebhookPage | EndpointPage;

    export type ApiPageOrSubpackage = ApiPage | SubpackageSection;
}

export const SidebarNode = {
    isPage: (node: SidebarNode.Page | SidebarNodeRaw.Link): node is SidebarNode.Page => node.type === "page",
    isApiPage: (node: SidebarNode.Page | SidebarNode.ApiSection): node is SidebarNode.ApiPage => "apiType" in node,
    isChangelogPage: (node: SidebarNode.Page): node is SidebarNode.ChangelogPage =>
        node.type === "page" && (node as SidebarNode.ChangelogPage).pageType === "changelog",
    isEndpointPage: (node: SidebarNode.Page): node is SidebarNode.EndpointPage =>
        node.type === "page" && "method" in node,
};

export const SidebarNodeRaw = {
    isPage: (node: SidebarNodeRaw.Page | SidebarNodeRaw.Link): node is SidebarNodeRaw.Page => node.type === "page",
    isApiPage: (node: SidebarNodeRaw.Page | SidebarNodeRaw.ApiSection): node is SidebarNodeRaw.ApiPage =>
        "apiType" in node,
    isChangelogPage: (node: SidebarNodeRaw.Page): node is SidebarNodeRaw.ChangelogPage =>
        node.type === "page" && (node as SidebarNodeRaw.ChangelogPage).pageType === "changelog",
    isEndpointPage: (node: SidebarNodeRaw.Page): node is SidebarNodeRaw.EndpointPage =>
        node.type === "page" && "method" in node,
    isSubpackageSection: (node: SidebarNodeRaw.ApiPageOrSubpackage): node is SidebarNodeRaw.SubpackageSection =>
        node.type === "apiSection",
};
