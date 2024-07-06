import { DocsV1Read } from "@fern-api/fdr-sdk";
import { JsonLd } from "@fern-ui/next-seo";
import grayMatter from "gray-matter";

export declare namespace Layout {
    /**
     * The layout used for guides. This is the default layout.
     * Guides are typically long-form content that is meant to be read from start to finish.
     */
    type GuideLayout = "guide";

    /**
     * The layout used for overview pages.
     * Overview pages are typically meant to be a landing page for a section of the documentation.
     * These pages are 50% wider than guide pages, but the table of contents is still visible.
     */
    type OverviewLayout = "overview";

    /**
     * Reference pages are best used for API docs or other material that is meant to have a right-hand column.
     * Refrence pages are 2x the width of guide pages, and should be paired with <Aside> component.
     * Aside will generate a sticky right-hand column for the page, which is useful for code snippets.
     * Table of contents are always hidden on reference pages.
     */
    type ReferenceLayout = "reference";

    /**
     * The layout used for full-width pages. This is useful for landing pages or other custom layouts.
     * Both the navigation sidebar and the table of contents are hidden.
     * The content will take up the full width of the page-width container, which is set by docs.yml.
     */
    type PageLayout = "page";

    /**
     * This layout takes over 100% of the viewport width, below the header.
     * Unlike PageLayout, the content will not be constrained to the page-width container, and does not have padding.
     */
    type CustomLayout = "custom";
}

type Layout =
    | Layout.GuideLayout
    | Layout.OverviewLayout
    | Layout.ReferenceLayout
    | Layout.PageLayout
    | Layout.CustomLayout;

export interface FernDocsFrontmatter extends DocsV1Read.MetadataConfig {
    /**
     * The layout of the page. This will determine the width of the content.
     * Defaults to "guide"
     */
    layout?: Layout;

    /**
     * The title of the page. If not set, the title will inherit what's set in the sidebar.
     * This is also used for the <title> tag in the HTML.
     */
    title?: string;

    /**
     * The description of the page. This is used for the <meta name="description"> tag in the HTML.
     */
    description?: string;

    /**
     * The subtitle of the page. This is a markdown string that is rendered below the title.
     * If `description` is not set, this will be used for the <meta name="description"> tag in the HTML.
     */
    subtitle?: string;

    /**
     * The URL to the page's image. This is used for the <meta property="og:image"> tag in the HTML.
     */
    image?: string;

    /**
     * Renders an "Edit this page" link at the bottom of the page.
     */
    "edit-this-page-url"?: string;

    /**
     * Hides the table of contents.
     */
    "hide-toc"?: boolean;

    /**
     * Forces the table of contents to be generated for steps, accordions, and tabs.
     */
    "force-toc"?: boolean;

    /**
     * Hides the (prev, next) navigation links at the bottom of the page.
     */
    "hide-nav-links"?: boolean;

    /**
     * Hides the feedback form at the bottom of the page.
     */
    "hide-feedback"?: boolean;

    "jsonld:breadcrumb"?: JsonLd.BreadcrumbListSchema;

    /**
     * Disables image zoom on the page.
     */
    "no-image-zoom"?: boolean;

    breadcrumbs?: string[];

    // deprecated:
    editThisPageUrl?: string; // use "edit-this-page-url" instead
    excerpt?: string; // use subtitle instead
}

export function getFrontmatter(content: string): {
    data: FernDocsFrontmatter;
    content: string;
} {
    try {
        const gm = grayMatter(content);
        return {
            data: gm.data,
            content: gm.content,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return {
            data: {},
            content,
        };
    }
}
