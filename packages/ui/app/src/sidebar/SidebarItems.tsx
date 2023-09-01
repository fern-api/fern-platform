import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { SidebarDocsSection } from "./SidebarDocsSection";
import { SidebarItem } from "./SidebarItem";

export declare namespace SidebarItems {
    export interface Props {
        slug: string;
        navigationItems: FernRegistryDocsRead.NavigationItem[];
    }
}

export const SidebarItems: React.FC<SidebarItems.Props> = ({ slug, navigationItems }) => {
    return (
        <div className="flex flex-col">
            {navigationItems.map((navigationItem) =>
                visitDiscriminatedUnion(navigationItem, "type")._visit({
                    page: (pageMetadata) => (
                        <SidebarItem
                            key={pageMetadata.urlSlug}
                            slug={joinUrlSlugs(slug, pageMetadata.urlSlug)}
                            title={pageMetadata.title}
                        />
                    ),
                    section: (section) => (
                        <SidebarDocsSection
                            key={section.urlSlug}
                            slug={joinUrlSlugs(slug, section.urlSlug)}
                            section={section}
                        />
                    ),
                    api: (apiSection) => (
                        <ApiDefinitionContextProvider key={apiSection.urlSlug} apiSection={apiSection} apiSlug={slug}>
                            <ApiSidebarSection slug={joinUrlSlugs(slug, apiSection.urlSlug)} />
                        </ApiDefinitionContextProvider>
                    ),
                    _other: () => null,
                })
            )}
        </div>
    );
};
