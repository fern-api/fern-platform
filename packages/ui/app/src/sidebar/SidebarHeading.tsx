import { ChevronDownIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { range } from "lodash-es";
import { FC, ReactNode } from "react";
import { useCollapseSidebar } from "./CollapseSidebarContext";

interface SidebarHeadingProps {
    className?: string;
    title?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    depth: number;
    toggleExpand?: () => void;
    slug: readonly string[];
    rightElement?: ReactNode;
    hidden: boolean;
    icon: string | undefined;
}

export const SidebarHeading: FC<SidebarHeadingProps> = ({
    className,
    title,
    depth,
    toggleExpand,
    slug,
    rightElement,
    hidden,
    icon,
}) => {
    const { checkExpanded } = useCollapseSidebar();
    const expanded = checkExpanded(slug);
    return (
        <div className={cn(className, "flex min-h-[32px] lg:min-h-[36px]")}>
            {range(0, depth).map((i) => (
                <div key={i} className={"flex-0 border-default h-full w-3 shrink-0 border-r"} />
            ))}
            {toggleExpand != null && (
                <button
                    className={cn(
                        "t-muted flex w-6 justify-center items-center hover:bg-tag-primary/10 transition-colors",
                        {
                            "rounded-lg": depth === 0,
                        },
                    )}
                    onClick={toggleExpand}
                >
                    <ChevronDownIcon
                        className={cn("size-4 transition-transform", {
                            "-rotate-90": !expanded,
                            "rotate-0": expanded,
                        })}
                    />
                </button>
            )}
            {toggleExpand == null && depth > 0 && <div className={"w-6"} />}
            <span
                className={cn(
                    "inline-flex flex-1 content-between items-center px-4 lg:px-3 text-inherit no-underline hover:text-inherit hover:no-underline",
                    {
                        pointer: toggleExpand != null,
                    },
                )}
                onClick={toggleExpand}
            >
                <h6 className="m-0 flex-1 text-base leading-6 lg:text-sm lg:leading-5">{title}</h6>
                {rightElement}
            </span>
        </div>
    );
};
