import Link from "next/link";
import { ReactElement } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";

export function HeaderTabs(): ReactElement {
    const { tabs, currentTabIndex } = useDocsContext();
    return (
        <nav aria-label="tabs" className="bg-header border-concealed h-[44px] border-b max-lg:hidden">
            <ul className="max-w-page-width mx-auto flex shrink-0 list-none items-center justify-start px-4 md:px-6 lg:px-8">
                {tabs.map((tab) => (
                    <li key={tab.slug.join("/")} className="group">
                        <Link
                            className="group/tab-button data-[state=inactive]:hover:t-default data-[state=active]:t-accent data-[state=inactive]:t-muted data-[state=active]:after:bg-accent-primary relative flex min-h-[32px] min-w-0 flex-1 select-none items-center justify-start p-3 text-base group-first:pl-0 group-first:after:left-0 group-last:pr-0 group-last:after:right-0 group-hover/tab-button:transition data-[state=active]:after:absolute data-[state=active]:after:inset-x-3 data-[state=active]:after:bottom-0 data-[state=active]:after:h-px data-[state=active]:after:content-[''] lg:min-h-[36px] lg:text-sm"
                            href={`/${tab.slug.join("/")}`}
                            data-state={tab.index === currentTabIndex ? "active" : "inactive"}
                        >
                            <div className="flex min-w-0 items-center justify-start space-x-2">
                                {tab.icon && (
                                    <RemoteFontAwesomeIcon
                                        className="bg-text-muted group-hover/tab-button:bg-text-default group-data-[state=active]/tab-button:bg-accent group-hover/tab-button:group-data-[state=active]/tab-button:bg-accent size-3.5"
                                        icon={tab.icon}
                                    />
                                )}
                                <span className="truncate font-medium">{tab.title}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
