import { DefinitionObjectFactory, PathResolver } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";

export interface GetFullSlugOpts {
    /**
     * Version slug is included by default.
     */
    omitVersionSlug?: boolean;
    /**
     * Defaults to the currently active tab slug.
     */
    tabSlug?: string;
    /**
     * Tab slug is included by default.
     */
    omitTabSlug?: boolean;
}

export interface NavigateToPathOpts extends GetFullSlugOpts {}

export const NavigationContext = React.createContext<NavigationContextValue>({
    hasInitialized: false,
    justNavigated: false,
    navigateToPath: noop,
    getFullSlug: () => "",
    userIsScrolling: () => false,
    onScrollToPath: noop,
    observeDocContent: noop,
    resolver: new PathResolver({
        docsDefinition: DefinitionObjectFactory.createDocsDefinition(),
    }),
});

export interface NavigationContextValue {
    hasInitialized: boolean;
    justNavigated: boolean;
    navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts) => void;
    /** Returns the version-prefixed slug. */
    getFullSlug: (slug: string, opts?: { tabSlug?: string }) => string;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    resolver: PathResolver;
}
