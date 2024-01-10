import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { FontAwesomeIcon } from "../commons/FontAwesomeIcon";

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
                    "text-base lg:text-sm flex flex-1 py-2 px-3 group/tab-button transition rounded-lg justify-start items-center select-none min-w-0",
                    {
                        "text-accent-primary dark:text-accent-primary-dark": selected,
                        "t-muted hover:text-accent-primary hover:dark:text-accent-primary-dark": !selected,
                    }
                )}
                href={`/${slug}`}
            >
                <div className="flex min-w-0 items-center justify-start space-x-4 lg:space-x-3">
                    <div className="min-w-fit">
                        <div
                            className={classNames(
                                "flex h-6 w-6 items-center border justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-primary group-hover/tab-button:dark:bg-tag-primary-dark group-hover/tab-button:dark:border-border-primary-dark",
                                {
                                    "bg-tag-primary border-border-primary dark:bg-tag-primary-dark dark:border-border-primary-dark":
                                        selected,
                                    "bg-tag-default-light/5 dark:bg-tag-default-dark/5 border-transparent": !selected,
                                }
                            )}
                        >
                            <FontAwesomeIcon
                                className={classNames(
                                    "h-3.5 w-3.5 group-hover/tab-button:text-accent-primary group-hover/tab-button:dark:text-accent-primary-dark",
                                    {
                                        "text-accent-primary dark:text-accent-primary-dark": selected,
                                        "t-muted": !selected,
                                    }
                                )}
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
