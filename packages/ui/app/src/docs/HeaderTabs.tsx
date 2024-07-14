import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { CURRENT_TAB_INDEX_ATOM, TABS_ATOM } from "../atoms";
import { FernLink } from "../components/FernLink";
import { getSidebarTabHref } from "../util/getSidebarTabHref";

export function HeaderTabs(): ReactElement {
    const tabs = useAtomValue(TABS_ATOM);
    const currentTabIndex = useAtomValue(CURRENT_TAB_INDEX_ATOM);
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
