import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { ReactElement } from "react";
import { FernLink } from "../components/FernLink";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { getSidebarTabHref } from "../util/getSidebarTabHref";

export function HeaderTabs(): ReactElement {
    const { tabs, currentTabIndex } = useDocsContext();
    return (
        <nav aria-label="tabs" className="h-[44px] max-lg:hidden mt-1.5">
            <ul className="mx-auto flex max-w-page-width shrink-0 list-none items-center justify-start px-4 md:px-6 lg:px-8">
                {tabs.map((tab) => (
                    <li key={tab.index} className="group">
                        <FernLink
                            className="group/tab-button relative flex min-h-[32px] min-w-0 flex-1 select-none items-center justify-start p-3 text-base data-[state=inactive]:t-muted data-[state=active]:text-black data-[state=active]:font-semibold data-[state=inactive]:hover:t-default group-first:pl-0 lg:min-h-[36px] lg:text-sm"
                            href={getSidebarTabHref(tab)}
                            data-state={tab.index === currentTabIndex ? "active" : "inactive"}
                        >
                            <div className="flex min-w-0 items-center justify-start space-x-2">
                                {tab.icon && (
                                    <RemoteFontAwesomeIcon
                                        className="size-3.5 bg-text-muted group-data-[state=active]/tab-button:bg-black group-hover/tab-button:group-data-[state=active]/tab-button:bg-black group-hover/tab-button:bg-text-default"
                                        icon={tab.icon}
                                    />
                                )}
                                <span className="truncate font-medium">{tab.title}</span>
                            </div>
                        </FernLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
