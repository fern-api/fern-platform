import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedUntabbedNavigationConfig, type ResolvedUrlPath } from "@fern-ui/app-utils";
import { useCallback, useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { HEADER_HEIGHT } from "../constants";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { TableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        path: ResolvedUrlPath.MdxPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ path }) => {
    const { resolvePage } = useDocsContext();
    const { activeNavigationConfigContext } = useDocsSelectors();

    const page = useMemo(() => resolvePage(path.page.id), [path.page.id, resolvePage]);

    const findTitle = useCallback(
        (navigationItems: FernRegistryDocsRead.NavigationItem[]) => {
            for (const navigationItem of navigationItems) {
                if (navigationItem.type !== "section") {
                    continue;
                }
                const [sectionSlugInferredFromPath] = path.slug.split("/");
                if (sectionSlugInferredFromPath != null && navigationItem.urlSlug === sectionSlugInferredFromPath) {
                    return navigationItem.title;
                }
            }
            return undefined;
        },
        [path.slug]
    );

    const sectionTitle = useMemo(() => {
        if (isUnversionedUntabbedNavigationConfig(activeNavigationConfigContext.config)) {
            return findTitle(activeNavigationConfigContext.config.items);
        } else {
            for (const tab of activeNavigationConfigContext.config.tabs) {
                const title = findTitle(tab.items);
                if (title != null) {
                    return title;
                }
            }
            return undefined;
        }
    }, [activeNavigationConfigContext, findTitle]);

    const content = useMemo(() => {
        return <MdxContent mdx={path.serializedMdxContent} />;
    }, [path]);

    return (
        <div className="flex space-x-16 px-6 md:px-12">
            <div className="w-full min-w-0 max-w-3xl pt-8">
                {sectionTitle != null && (
                    <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                        {sectionTitle}
                    </div>
                )}

                <div className="text-text-primary-light dark:text-text-primary-dark mb-8 text-3xl font-bold">
                    {path.page.title}
                </div>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <div className="hidden w-64 xl:flex">
                <TableOfContents
                    className="sticky w-full overflow-auto overflow-x-hidden py-8"
                    markdown={page.markdown}
                    style={{
                        maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
                        top: HEADER_HEIGHT,
                    }}
                />
            </div>
        </div>
    );
};
