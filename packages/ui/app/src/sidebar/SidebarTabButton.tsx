import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";

export declare namespace SidebarTabButton {
    export interface Props {
        tab: DocsV1Read.NavigationTab;
        selected: boolean;
        slug: string;
    }
}

const UnmemoizedSidebarTabButton: React.FC<SidebarTabButton.Props> = ({ tab, selected, slug }) => {
    return (
        <li>
            <Link
                className={classNames(
                    "no-underline hover:no-underline min-h-[44px] lg:min-h-[36px]",
                    "text-base lg:text-sm flex flex-1 py-2 px-3 group/tab-button group-hover/tab-button:transition rounded-lg justify-start items-center select-none min-w-0 hover:text-accent-primary",
                    {
                        "text-accent-primary": selected,
                        "t-muted": !selected,
                    },
                )}
                href={`/${slug}`}
            >
                <div className="flex min-w-0 items-center justify-start space-x-4 lg:space-x-3">
                    <div className="min-w-fit">
                        <div
                            className={classNames(
                                "flex size-6 items-center border border-border-default-light dark:border-border-default-dark justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-primary group-hover/tab-button:dark:border-border-primary-dark",
                                {
                                    "bg-tag-primary border-border-primary dark:border-border-primary-dark": selected,
                                    "bg-tag-default-light/5 dark:bg-tag-default-dark/5": !selected,
                                },
                            )}
                        >
                            <RemoteFontAwesomeIcon
                                className={classNames("size-3.5 group-hover/tab-button:bg-accent-primary", {
                                    "bg-accent-primary": selected,
                                    "bg-text-muted-light dark:bg-text-muted-dark": !selected,
                                })}
                                icon={tab.icon}
                            />
                        </div>
                    </div>
                    <span className="truncate font-medium">{tab.title}</span>
                </div>
            </Link>
        </li>
    );
};

export const SidebarTabButton = memo(UnmemoizedSidebarTabButton);
