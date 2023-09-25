import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { memo } from "react";

export declare namespace SidebarItemTitle {
    export interface Props {
        title: JSX.Element | string;
        leftElement?: JSX.Element;
        rightElement?: JSX.Element;
        indent?: boolean;
        isSelected: boolean;
        isHovering: boolean;
    }
}

const UnmemoizedSidebarItemTitle: React.FC<SidebarItemTitle.Props> = ({
    title,
    leftElement,
    rightElement,
    indent = false,
    isSelected,
    isHovering,
}) => {
    return (
        <div
            className={classNames("relative w-full", {
                "pl-[18px] border-l border-border-default-light dark:border-border-default-dark": indent,
            })}
        >
            {indent && isSelected && (
                <div className="bg-border-default-light dark:bg-border-default-dark absolute left-0 top-[50%] h-px w-[12px]" />
            )}
            <div
                className={classNames(
                    "flex flex-1 py-2 px-3 border rounded-lg items-center justify-between select-none min-w-0",
                    {
                        "text-accent-primary border-border-primary bg-tag-primary": isSelected,
                        "border-transparent": !isSelected,
                        "bg-tag-default-light dark:bg-tag-default-dark text-text-primary-light dark:text-text-primary-dark":
                            !isSelected && isHovering,
                        "t-muted": !isSelected && !isHovering,
                    }
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    {leftElement}
                    <Text ellipsize>{title}</Text>
                </div>
                {rightElement}
            </div>
        </div>
    );
};

export const SidebarItemTitle = memo(UnmemoizedSidebarItemTitle);
