import { Text } from "@blueprintjs/core";
import { type NavigationTab } from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";
import { memo, type MouseEventHandler } from "react";
import { FontAwesomeIcon } from "../commons/FontAwesomeIcon";

export declare namespace SidebarTabButton {
    export interface Props {
        tab: NavigationTab;
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
                    "text-accent-primary": isSelected,
                    "t-muted hover:text-accent-primary": !isSelected,
                }
            )}
            onClick={onClick}
        >
            <div className="flex min-w-0 items-center justify-start space-x-3">
                <div className="min-w-fit">
                    <div
                        className={classNames(
                            "flex h-6 w-6 items-center border justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-primary",
                            {
                                "bg-tag-primary border-border-primary": isSelected,
                                "bg-tag-default-light/5 dark:bg-tag-default-dark/5 border-transparent": !isSelected,
                            }
                        )}
                    >
                        <FontAwesomeIcon
                            className={classNames("h-3.5 w-3.5 group-hover/tab-button:text-accent-primary", {
                                "text-accent-primary": isSelected,
                                "t-muted": !isSelected,
                            })}
                            icon={tab.icon}
                        />
                    </div>
                </div>
                <Text ellipsize className="font-medium">
                    {tab.title}
                </Text>
            </div>
        </button>
    );
};

export const SidebarTabButton = memo(UnmemoizedSidebarTabButton);
