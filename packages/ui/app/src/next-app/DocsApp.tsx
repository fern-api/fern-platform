import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { Docs } from "../docs/Docs";

export declare namespace App {
    export interface Props {
        hasBackgroundImage: boolean;
        navbarLinks: DocsV1Read.NavbarLink[];
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;
        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        isApiPlaygroundEnabled: boolean;
        isWhiteLabeled: boolean;
    }
}

export const DocsApp: React.FC<App.Props> = ({
    hasBackgroundImage,
    search: unmemoizedSearch,
    algoliaSearchIndex,
    navbarLinks,
    logoHeight,
    logoHref,
    isApiPlaygroundEnabled,
    isWhiteLabeled,
}) => {
    const search = useDeepCompareMemoize(unmemoizedSearch);
    return (
        <div className="flex min-h-screen flex-1">
            <div className="w-full">
                <Docs
                    hasBackgroundImage={hasBackgroundImage}
                    navbarLinks={navbarLinks}
                    logoHeight={logoHeight}
                    logoHref={logoHref}
                    search={search}
                    algoliaSearchIndex={algoliaSearchIndex}
                    isApiPlaygroundEnabled={isApiPlaygroundEnabled}
                    isWhiteLabeled={isWhiteLabeled}
                />
            </div>
        </div>
    );
};
