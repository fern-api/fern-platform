import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { SidebarTab } from "@fern-ui/fdr-utils";
import clsx from "clsx";
import { Lock } from "iconoir-react";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { CURRENT_TAB_INDEX_ATOM, TABS_ATOM } from "../atoms";
import { FernLink } from "../components/FernLink";
import { useSidebarTabHref } from "../hooks/useSidebarTabHref";

export function HeaderTabs(): ReactElement {
    const tabs = useAtomValue(TABS_ATOM);
    return (
        <ul className="fern-header-tabs-list">
            {tabs.map((tab) => (
                <HeaderTab key={tab.index} tab={tab} />
            ))}
        </ul>
    );
}

export function HeaderTab({ tab }: { tab: SidebarTab }): ReactElement {
    const currentTabIndex = useAtomValue(CURRENT_TAB_INDEX_ATOM);
    return (
        <li className="fern-header-tabs-list-item">
            <FernLink
                className={clsx("fern-header-tab-button", {
                    "opacity-50": tab.type !== "tabLink" && tab.hidden,
                })}
                href={useSidebarTabHref(tab)}
                data-state={currentTabIndex === tab.index ? "active" : "inactive"}
            >
                <div className="flex min-w-0 items-center justify-start space-x-2">
                    {tab.icon && <RemoteFontAwesomeIcon icon={tab.icon} />}
                    <span className="truncate font-medium">{tab.title}</span>
                    {tab.type !== "tabLink" && tab.authed && <Lock className="size-4 self-center text-faded" />}
                </div>
            </FernLink>
        </li>
    );
}
