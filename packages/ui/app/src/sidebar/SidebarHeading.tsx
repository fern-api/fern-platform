import classNames from "classnames";
import { range } from "lodash-es";
import { FC, ReactNode } from "react";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";

interface SidebarHeadingProps {
    className?: string;
    title?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    depth: number;
    toggleExpand?: () => void;
    expanded?: boolean;
    rightElement?: ReactNode;
}

export const SidebarHeading: FC<SidebarHeadingProps> = ({
    className,
    title,
    depth,
    toggleExpand,
    expanded = false,
    rightElement,
}) => (
    <div className={classNames(className, "flex min-h-[44px] lg:min-h-[36px]")}>
        {range(0, depth).map((i) => (
            <div
                key={i}
                className={
                    "flex-0 border-border-default-light dark:border-border-default-dark h-full w-3 shrink-0 border-r"
                }
            />
        ))}
        {toggleExpand != null && (
            <button
                className={classNames(
                    "t-muted flex w-6 justify-center items-center hover:bg-tag-primary/10 hover:dark:bg-tag-primary-dark/10 transition-colors",
                    {
                        "rounded-lg": depth === 0,
                    }
                )}
                onClick={toggleExpand}
            >
                <ChevronDownIcon
                    className={classNames("h-4 w-4 transition-transform", {
                        "-rotate-90": !expanded,
                        "rotate-0": expanded,
                    })}
                />
            </button>
        )}
        {toggleExpand == null && depth > 0 && <div className={"w-6"} />}
        <span
            className={classNames(
                "inline-flex flex-1 content-between items-center px-4 lg:px-3 text-inherit no-underline hover:text-inherit hover:no-underline",
                {
                    pointer: toggleExpand != null,
                }
            )}
            onClick={toggleExpand}
        >
            <h6 className="m-0 flex-1 text-base leading-5 lg:text-sm lg:leading-4">{title}</h6>
            {rightElement}
        </span>
    </div>
);
