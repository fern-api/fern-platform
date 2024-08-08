import { DocsV1Read } from "@fern-api/fdr-sdk/client/types";

/**
 * The layout used for guides. This is the default layout.
 * Guides are typically long-form content that is meant to be read from start to finish.
 */
type GuideLayout = "guide";

/**
 * The layout used for overview pages.
 * Overview pages are typically meant to be a landing page for a section of the documentation.
 * These pages are 50% wider than guide pages, and is best used with <Column> components.
 */
type OverviewLayout = "overview";

/**
 * The layout used for reference pages.
 * Reference pages are the widest layout and are best used for tables and other wide content.
 * Refrence pages are 2x the width of guide pages, and should be paired with <Aside> component.
 * Aside will generate a sticky right-hand column for the page, which is useful for code snippets.
 * Table of contents are always hidden on reference pages.
 */
type ReferenceLayout = "reference";

export interface FernDocsFrontmatter {
    /**
     * The layout of the page. This will determine the width of the content.
     * Defaults to "guide"
     */
    layout?: GuideLayout | OverviewLayout | ReferenceLayout;

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
    image?: string | DocsV1Read.FileIdOrUrl;

    /**
     * Full slug of the page.
     */
    slug?: string;

    /**
     * Renders an "Edit this page" link at the bottom of the page.
     */
    "edit-this-page-url"?: string;

    /**
     * Hides the table of contents.
     */
    "hide-toc"?: boolean;

    /**
     * Hides the (prev, next) navigation links at the bottom of the page.
     */
    "hide-nav-links"?: boolean;

    /**
     * Hides the feedback form at the bottom of the page.
     */
    "hide-feedback"?: boolean;

    // deprecated:
    editThisPageUrl?: string; // use "edit-this-page-url" instead
    excerpt?: string; // use subtitle instead
}
