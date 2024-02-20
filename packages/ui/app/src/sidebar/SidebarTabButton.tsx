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
                    "no-underline hover:no-underline min-h-[32px] lg:min-h-[36px]",
                    "text-base lg:text-sm flex flex-1 py-2 lg:px-3 group/tab-button group-hover/tab-button:transition rounded-lg justify-start items-center select-none min-w-0 hover:t-accent",
                    {
                        "t-accent": selected,
                        "t-muted": !selected,
                    },
                )}
                href={`/${slug}`}
            >
                <div className="flex min-w-0 items-center justify-start space-x-4 lg:space-x-3">
                    <div className="min-w-fit">
                        <div
                            className={classNames(
                                "flex size-6 items-center border border-default justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-accent-muted-light group-hover/tab-button:dark:border-border-accent-muted-dark",
                                {
                                    "bg-tag-primary border-border-accent-muted-light dark:border-border-accent-muted-dark":
                                        selected,
                                    "bg-tag-default": !selected,
                                },
                            )}
                        >
                            <RemoteFontAwesomeIcon
                                className={classNames("size-3.5 group-hover/tab-button:bg-accent", {
                                    "bg-accent": selected,
                                    "bg-text-muted": !selected,
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
