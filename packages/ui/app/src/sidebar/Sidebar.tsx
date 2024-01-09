import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { BuiltWithFern } from "./BuiltWithFern";
import styles from "./Sidebar.module.scss";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";

export declare namespace Sidebar {
    export interface Props {
        hideSearchBar?: boolean;
    }
}

export const Sidebar: React.FC<Sidebar.Props> = ({ hideSearchBar = false }) => {
    const { docsDefinition, resolveApi } = useDocsContext();
    const { activeNavigatable, registerScrolledToPathListener } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionAndTabSlugs, selectedSlug } = useDocsSelectors();
    const { closeMobileSidebar } = useMobileSidebarContext();

    const navigationItems =
        activeNavigationConfigContext.type === "tabbed"
            ? activeNavigatable.context.tab?.items
            : activeNavigationConfigContext.config.items;

    return (
        <nav className="group/sidebar w-full min-w-0" aria-label="secondary">
            <SidebarFixedItemsSection className="md:sticky md:top-0 md:z-10" hideSearchBar={hideSearchBar} />
            <div
                className={classNames(
                    "flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-12",
                    "px-4",
                    styles.scrollingContainer
                )}
            >
                {navigationItems != null && (
                    <SidebarSection
                        navigationItems={navigationItems}
                        slug={withVersionAndTabSlugs("", { omitDefault: true })}
                        selectedSlug={selectedSlug}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        closeMobileSidebar={closeMobileSidebar}
                        docsDefinition={docsDefinition}
                        activeTabIndex={activeNavigatable.context.tab?.index ?? null}
                        resolveApi={resolveApi}
                        depth={0}
                        topLevel={true}
                    />
                )}
                <BuiltWithFern />
            </div>
        </nav>
    );
};
