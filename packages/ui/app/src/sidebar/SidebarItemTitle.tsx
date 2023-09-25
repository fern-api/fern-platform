import { useBooleanState } from "@fern-ui/react-commons";

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
    isHovering: isHoveringItem,
}) => {
    const {
        value: isHoveringTitle,
        setTrue: markAsHoveringTitle,
        setFalse: markAsNotHoveringTitle,
    } = useBooleanState(false);
    const {
        value: isHoveringTooltip,
        setTrue: markAsHoveringTooltip,
        setFalse: markAsNotHoveringTooltip,
    } = useBooleanState(false);
    return (
        <div
            className={classNames("relative w-full", {
                "pl-[18px] border-l border-border-default-light dark:border-border-default-dark": indent,
            })}
        >
            <div
                className={classNames(
                    "absolute -top-5 border border-border-concealed-light dark:border-border-concealed-dark -right-3 rounded shadow-lg px-2 py-1 text-xs bg-background t-muted",
                    {
                        visible: isHoveringTitle || isHoveringTooltip,
                        invisible: !isHoveringTitle && !isHoveringTooltip,
                    }
                )}
                onMouseEnter={markAsHoveringTooltip}
                onMouseLeave={markAsNotHoveringTooltip}
            >
                {title}
            </div>

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
                            !isSelected && isHoveringItem,
                        "t-muted": !isSelected && !isHoveringItem,
                    }
                )}
            >
                <div
                    className="flex min-w-0 items-center gap-2"
                    onMouseEnter={markAsHoveringTitle}
                    onMouseLeave={markAsNotHoveringTitle}
                >
                    {leftElement}
                    <span className="truncate">{title}</span>
                </div>
                {rightElement}
            </div>
        </div>
    );
};

export const SidebarItemTitle = memo(UnmemoizedSidebarItemTitle);
