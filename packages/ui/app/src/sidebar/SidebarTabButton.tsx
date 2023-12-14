import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { memo, type MouseEventHandler } from "react";
import { FontAwesomeIcon } from "../commons/FontAwesomeIcon";

export declare namespace SidebarTabButton {
    export interface Props {
        tab: DocsV1Read.NavigationTab;
        isSelected: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

const UnmemoizedSidebarTabButton: React.FC<SidebarTabButton.Props> = ({ tab, isSelected, onClick }) => {
    return (
        <button
            className={classNames(
                "flex flex-1 py-2 px-3 group/tab-button transition rounded-lg justify-start items-center select-none min-w-0",
                {
                    "text-accent-primary dark:text-accent-primary-dark": isSelected,
                    "t-muted hover:text-accent-primary hover:dark:text-accent-primary-dark": !isSelected,
                }
            )}
            onClick={onClick}
        >
            <div className="flex min-w-0 items-center justify-start space-x-3">
                <div className="min-w-fit">
                    <div
                        className={classNames(
                            "flex h-6 w-6 items-center border justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-primary group-hover/tab-button:dark:bg-tag-primary-dark group-hover/tab-button:dark:border-border-primary-dark",
                            {
                                "bg-tag-primary border-border-primary dark:bg-tag-primary-dark dark:border-border-primary-dark":
                                    isSelected,
                                "bg-tag-default-light/5 dark:bg-tag-default-dark/5 border-transparent": !isSelected,
                            }
                        )}
                    >
                        <FontAwesomeIcon
                            className={classNames(
                                "h-3.5 w-3.5 group-hover/tab-button:text-accent-primary group-hover/tab-button:dark:text-accent-primary-dark",
                                {
                                    "text-accent-primary dark:text-accent-primary-dark": isSelected,
                                    "t-muted": !isSelected,
                                }
                            )}
                            icon={tab.icon}
                        />
                    </div>
                </div>
                <span className="truncate font-medium">{tab.title}</span>
            </div>
        </button>
    );
};

export const SidebarTabButton = memo(UnmemoizedSidebarTabButton);
