import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback, useRef } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace CollapsableSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        collapsed: boolean;
        className?: string;
        onClick: () => void;
    }
}

export const CollapsableSidebarItem: React.FC<CollapsableSidebarItem.Props> = ({
    title,
    collapsed,
    className,
    onClick,
}) => {
    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <div
                    className={classNames(
                        "flex flex-1 py-2 px-3 rounded-lg justify-start items-center select-none min-w-0",
                        {
                            "bg-tag-default-light dark:bg-tag-default-dark text-text-primary-light dark:text-text-primary-dark":
                                isHovering,
                            "t-muted": !isHovering,
                        }
                    )}
                >
                    <div className="flex min-w-0 items-center justify-start space-x-2">
                        <div className="min-w-fit">
                            <ChevronDownIcon
                                className={classNames("text-sm h-5 w-5 -ml-[6px] transition-transform", {
                                    "-rotate-90": collapsed,
                                    "rotate-0": !collapsed,
                                })}
                            />
                        </div>

                        <Text ellipsize>{title}</Text>
                    </div>
                </div>
            );
        },
        [collapsed, title]
    );

    const ref = useRef<HTMLButtonElement>(null);

    return (
        <button className={classNames(className)} ref={ref} onClick={onClick}>
            <SidebarItemLayout title={renderTitle} />
        </button>
    );
};
