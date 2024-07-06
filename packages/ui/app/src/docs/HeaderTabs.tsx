import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { ReactElement } from "react";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { getSidebarTabHref } from "../util/getSidebarTabHref";

export function HeaderTabs(): ReactElement {
    const { tabs, currentTabIndex } = useDocsContext();
    return (
        <ul className="fern-header-tabs-list">
            {tabs.map((tab) => (
                <li key={tab.index} className="fern-header-tabs-list-item">
                    <FernLink
                        className="fern-header-tab-button"
                        href={getSidebarTabHref(tab)}
                        data-state={tab.index === currentTabIndex ? "active" : "inactive"}
                    >
                        <div className="flex min-w-0 items-center justify-start space-x-2">
                            {tab.icon && <RemoteFontAwesomeIcon icon={tab.icon} />}
                            <span className="truncate font-medium">{tab.title}</span>
                        </div>
                    </FernLink>
                </li>
            ))}
        </ul>
    );
}
