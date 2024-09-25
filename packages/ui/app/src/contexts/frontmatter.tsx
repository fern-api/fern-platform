import * as FernDocs from "@fern-api/fdr-sdk/docs";
import { createContext, useContext } from "react";

export const EMPTY_FRONTMATTER: FernDocs.Frontmatter = {
    layout: undefined,
    title: undefined,
    headline: undefined,
    description: undefined,
    subtitle: undefined,
    image: undefined,
    "edit-this-page-url": undefined,
    "hide-toc": undefined,
    "force-toc": undefined,
    "hide-nav-links": undefined,
    "hide-feedback": undefined,
    "no-image-zoom": undefined,
    breadcrumb: undefined,
    excerpt: undefined,
    "og:site_name": undefined,
    "og:title": undefined,
    "og:description": undefined,
    "og:url": undefined,
    "og:image": undefined,
    "og:image:width": undefined,
    "og:image:height": undefined,
    "og:locale": undefined,
    "og:logo": undefined,
    "twitter:title": undefined,
    "twitter:description": undefined,
    "twitter:handle": undefined,
    "twitter:image": undefined,
    "twitter:site": undefined,
    "twitter:url": undefined,
    "twitter:card": undefined,
    noindex: undefined,
    nofollow: undefined,
    "jsonld:breadcrumb": undefined,
};

const FrontmatterContext = createContext<FernDocs.Frontmatter>(EMPTY_FRONTMATTER);

export const FrontmatterContextProvider = FrontmatterContext.Provider;

export const useFrontmatter = (): FernDocs.Frontmatter => {
    return useContext(FrontmatterContext);
};
