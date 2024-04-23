/* eslint-disable no-console */
import { DocsConfiguration, NavigationItem } from "@fern-fern/docs-config/api";
import { MintJsonSchema, MintNavigationItemPage } from "./mintlify";

export function migrateMintlifyToDocsConfig(mint: MintJsonSchema): DocsConfiguration {
    if (mint.analytics != null) {
        console.warn("Analytics configuration is not supported in docs.yml.");
    }

    if (mint.integrations != null) {
        console.warn("Integrations configuration is not supported in docs.yml.");
    }

    if (mint.feedback != null) {
        console.warn("Feedback configuration is not supported in docs.yml.");
    }

    if (mint.footerSocials != null) {
        console.warn("Footer socials configuration is not supported in docs.yml.");
    }

    if (mint.isWhiteLabeled != null) {
        console.warn("White label configuration is not supported in docs.yml.");
    }

    if (mint.search != null) {
        console.warn("Search configuration is not supported in docs.yml.");
    }

    if (mint.redirects != null) {
        console.warn("Redirects configuration is not supported in docs.yml.");
    }

    if (mint.seo != null) {
        console.warn("SEO configuration is not supported in docs.yml.");
    }

    return {
        instances: [],
        title: mint.name,
        logo: migrateLogo(mint.logo),
        favicon: mint.favicon,
        backgroundImage: mint.backgroundImage,
        colors: migrateColors(mint.colors),
        navbarLinks: migrateNavbarLinks(mint.topbarCtaButton, mint.topbarLinks),
        versions: migrateVersions(mint.versions),
        tabs: migrateTabs(mint.tabs, mint.topAnchor, mint.anchors),
        layout: {
            tabsPlacement: mint.tabs != null && mint.anchors == null ? "header" : "sidebar",
            searchbarPlacement: "header",
        },
        navigation: migrateNavigation(mint.navigation),
    };
}

function migrateLogo(logo: MintJsonSchema["logo"]): DocsConfiguration["logo"] {
    if (logo == null) {
        return undefined;
    }

    // TODO: add support for single-string logo in docs.yml
    if (typeof logo === "string") {
        return {
            light: logo,
            dark: logo,
        };
    }

    return {
        light: logo.light,
        dark: logo.dark,
        href: logo.href,
        // TODO: add support for logo size
    };
}

function migrateVersions(versions: MintJsonSchema["versions"]): DocsConfiguration["versions"] {
    if (versions == null) {
        return undefined;
    }

    throw new Error("Not implemented: migrateVersions");
}

function migrateColors(colors: MintJsonSchema["colors"]): DocsConfiguration["colors"] {
    return {
        accentPrimary: {
            // TODO: verify that we want to use colors.dark/light as the primary accent color
            dark: colors.dark ?? colors.primary,
            light: colors.light ?? colors.primary,
        },
        background: {
            dark: colors.background?.dark,
            light: colors.background?.light,
        },
    };
}
function migrateNavbarLinks(
    topbarCtaButton: MintJsonSchema["topbarCtaButton"],
    topbarLinks: MintJsonSchema["topbarLinks"],
): DocsConfiguration["navbarLinks"] {
    if (topbarCtaButton == null && topbarLinks == null) {
        return undefined;
    }

    const links: DocsConfiguration["navbarLinks"] = [];

    topbarLinks?.forEach((link) => {
        if (link.type === "github") {
            console.warn("GitHub links in the navbar are not supported in docs.yml.");
        }
        links.push({
            type: "secondary",
            text: link.type === "github" ? "GitHub" : link.name,
            url: link.url,
        });
    });

    if (topbarCtaButton != null) {
        if (topbarCtaButton.type === "github") {
            console.warn("GitHub links in the navbar are not supported in docs.yml.");
        }
        links.push({
            type: "primary",
            text: topbarCtaButton.type === "github" ? "GitHub" : topbarCtaButton.name,
            url: topbarCtaButton.url,
        });
    }

    return links;
}

function migrateTabs(
    mintTabs: MintJsonSchema["tabs"],
    mintTopAnchor: MintJsonSchema["topAnchor"],
    mintAnchors: MintJsonSchema["anchors"],
): DocsConfiguration["tabs"] {
    if (mintTabs == null && mintAnchors == null && mintTopAnchor == null) {
        return undefined;
    }

    if (mintTabs != null && mintAnchors != null) {
        console.warn("Tabs and anchors are not supported together in docs.yml.");
    }

    const tabs: DocsConfiguration["tabs"] = {};

    mintTabs?.forEach((tab) => {
        if (tab.isDefaultHidden) {
            console.warn(`Tab "${tab.name}" is hidden by default. This is not supported in docs.yml.`);
        }

        if (tab.version != null) {
            console.warn(`Tab "${tab.name}" has a version. This is not supported in docs.yml.`);
        }

        if (isExternalUrl(tab.url)) {
            console.warn(`Tab "${tab.name}" has an external URL. This is not supported in docs.yml.`);
            return; // skip
        }

        tabs[tab.name] = {
            displayName: tab.name,
            slug: tab.url,
        };
    });

    if (mintTopAnchor != null) {
        console.warn("Top anchor is not supported in docs.yml.");
    }

    mintAnchors?.forEach((anchor) => {
        if (anchor.isDefaultHidden) {
            console.warn(`Anchor "${anchor.name}" is hidden by default. This is not supported in docs.yml.`);
        }

        if (anchor.version != null) {
            console.warn(`Anchor "${anchor.name}" has a version. This is not supported in docs.yml.`);
        }

        if (anchor.color != null) {
            console.warn(`Anchor "${anchor.name}" has a color. This is not supported in docs.yml.`);
        }

        if (isExternalUrl(anchor.url)) {
            console.warn(`Tab "${anchor.name}" has an external URL. This is not supported in docs.yml.`);
            return; // skip
        }

        tabs[anchor.name] = {
            displayName: anchor.name,
            slug: anchor.url,
            icon: getIcon(anchor),
        };
    });

    return tabs;
}

function migrateNavigation(navigation: MintJsonSchema["navigation"]): DocsConfiguration["navigation"] {
    if (navigation == null) {
        return undefined;
    }

    const items = migrateNavigationItems(navigation);

    // TODO: implement folder-level navigation handling
    // TODO: implement version/tab handlers

    return items;
}

function migrateNavigationItems(items: MintNavigationItemPage[]): NavigationItem[] {
    return items.map((item): NavigationItem => {
        if (typeof item === "string") {
            if (isExternalUrl(item)) {
                return {
                    link: "External Link",
                    href: item,
                };
            }

            return {
                page: "Untitled Page",
                path: item,
            };
        }

        if (item.version != null) {
            console.warn(`Navigation item "${item.group}" has a version. This is not supported yet.`);
        }
        return {
            section: item.group,
            icon: getIcon(item),
            contents: migrateNavigationItems(item.pages),
        };
    });
}

function getIcon({ icon, iconType }: { icon?: string; iconType?: string }): string | undefined {
    return iconType != null && icon != null ? `${iconType} ${icon}` : icon;
}

function isExternalUrl(url: string): boolean {
    return url.startsWith("http:") || url.startsWith("https:") || url.startsWith("mailto:") || url.startsWith("tel:");
}
