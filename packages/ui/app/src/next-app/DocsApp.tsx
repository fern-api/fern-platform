import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import "@fontsource/ibm-plex-mono";
import { useEffect } from "react";
import { initializePosthog } from "../analytics/posthog";
import { CONTEXTS } from "../contexts";
import { DocsContextProvider } from "../contexts/docs-context/DocsContextProvider";
import { NavigationContextProvider } from "../contexts/navigation-context/NavigationContextProvider";
import { Docs } from "../docs/Docs";
import { SidebarNavigation } from "../sidebar/types";
import type { ResolvedPath } from "../util/ResolvedPath";

export declare namespace App {
    export interface Props {
        baseUrl: DocsV2Read.BaseUrl;
        navigation: SidebarNavigation;
        hasBackgroundImage: boolean;
        colors: DocsV1Read.ColorsConfigV3 | undefined;
        navbarLinks: DocsV1Read.NavbarLink[];
        layout: DocsV1Read.DocsLayoutConfig | undefined;
        logo: DocsV1Read.FileId | undefined;
        logoV2: DocsV1Read.LogoV2 | undefined;
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;
        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;
        title: string | undefined;
    }
}

export const DocsApp: React.FC<App.Props> = ({
    baseUrl,
    navigation: unmemoizedNavigation,
    hasBackgroundImage,
    search: unmemoizedSearch,
    algoliaSearchIndex,
    files,
    resolvedPath: unmemoizedResolvedPath,
    colors,
    layout,
    navbarLinks,
    logo,
    logoV2,
    logoHeight,
    logoHref,
}) => {
    const search = useDeepCompareMemoize(unmemoizedSearch);
    const resolvedPath = useDeepCompareMemoize(unmemoizedResolvedPath);
    const navigation = useDeepCompareMemoize(unmemoizedNavigation);

    useEffect(() => {
        initializePosthog();
    }, []);

    return (
        <div className="flex min-h-screen flex-1">
            <div className="w-full">
                {CONTEXTS.reduceRight(
                    (children, Context) => (
                        <Context>{children}</Context>
                    ),
                    <DocsContextProvider files={files} layout={layout} baseUrl={baseUrl}>
                        <NavigationContextProvider
                            resolvedPath={resolvedPath}
                            navigation={navigation}
                            basePath={baseUrl.basePath}
                            title={title}
                        >
                            <Docs
                                hasBackgroundImage={hasBackgroundImage}
                                colors={colors}
                                layout={layout}
                                navbarLinks={navbarLinks}
                                logo={logo}
                                logoV2={logoV2}
                                logoHeight={logoHeight}
                                logoHref={logoHref}
                                search={search}
                                navigation={navigation}
                                algoliaSearchIndex={algoliaSearchIndex}
                            />
                        </NavigationContextProvider>
                    </DocsContextProvider>,
                )}
            </div>
        </div>
    );
};
