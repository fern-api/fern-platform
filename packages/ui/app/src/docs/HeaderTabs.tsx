import { ReactElement } from "react";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { getSidebarTabHref } from "../util/getSidebarTabHref";

export function HeaderTabs(): ReactElement {
    const { tabs, currentTabIndex } = useDocsContext();
    return (
        <nav aria-label="tabs" className="bg-white h-[48px] max-lg:hidden">
            <ul className="fern-tabs">
                {tabs.map((tab) => (
                    <li key={tab.index} className="fern-tab">
                        <FernLink
                            className="group/tab-button"
                            href={getSidebarTabHref(tab)}
                            data-state={tab.index === currentTabIndex ? "active" : "inactive"}
                        >
                            <div className="flex min-w-0 items-center justify-start space-x-2">
                                <span className="truncate font-medium font-headings">{tab.title}</span>
                            </div>
                        </FernLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
