import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import classNames from "classnames";
import Link, { LinkProps } from "next/link";
import { FC, Fragment, PropsWithChildren, ReactNode } from "react";
import { CheckIcon } from "../commons/icons/CheckIcon";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";

export declare namespace FernMenu {
    export interface Props extends PropsWithChildren {
        text: string;
        menuClassName?: string;
        icon?: ReactNode;
        align?: "left" | "right";
        clearSelection?: () => void;
    }
}

export const FernMenu: FC<FernMenu.Props> = ({
    text,
    icon,
    menuClassName,
    align = "left",
    clearSelection,
    children,
}) => {
    return (
        <HeadlessMenu as="div" className="relative inline-block text-left">
            <div className="my-auto flex">
                <HeadlessMenu.Button
                    className={classNames(
                        "group inline-flex w-full justify-center items-center space-x-2 rounded-lg",
                        "hover:bg-tag-primary",
                        "ring-1 ring-border-primary dark:ring-border-primary-dark hover:ring-2",
                        "transition-shadow",
                        "text-accent-primary dark:text-accent-primary-dark tracking-tight",
                        "py-1 pl-2.5 pr-1",
                        {
                            "rounded-r-none": clearSelection != null,
                        }
                    )}
                >
                    {({ open }) => {
                        return (
                            <>
                                {icon}
                                <span className="font-mono text-xs font-normal transition-colors">{text}</span>
                                <ChevronDownIcon
                                    className={classNames("h-5 w-5 transition !ml-1", {
                                        "rotate-180": open,
                                    })}
                                />
                            </>
                        );
                    }}
                </HeadlessMenu.Button>
                {clearSelection != null && (
                    <button
                        className="hover:bg-tag-primary border-border-primary dark:border-border-primary-dark text-accent-primary dark:text-accent-primary-dark -ml-px inline-flex w-fit items-center justify-center rounded-lg rounded-l-none border px-2 py-1 tracking-tight transition hover:border-2 hover:px-[calc(theme(spacing[2])-1px)]"
                        onClick={clearSelection}
                    >
                        <FontAwesomeIcon icon="close" />
                    </button>
                )}
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <HeadlessMenu.Items
                    className={classNames(
                        "z-10 bg-background dark:bg-background-dark absolute mt-2 origin-top-right divide-y divide-border-primary dark:divide-border-primary-dark border-border-primary dark:border-border-primary-dark rounded-md border shadow-lg flex flex-col",
                        {
                            "left-0": align === "left",
                            "right-0": align === "right",
                        },
                        menuClassName
                    )}
                >
                    {children}
                </HeadlessMenu.Items>
            </Transition>
        </HeadlessMenu>
    );
};

export declare namespace FernMenuItem {
    export interface Props {
        className?: string;
        href?: LinkProps["href"];
        onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
        selected?: boolean;
        children: ReactNode | ((active: boolean) => ReactNode);
        disableRoundCorners?: boolean;
    }
}

export const FernMenuItem: FC<FernMenuItem.Props> = ({
    className: parentClassName,
    href,
    onClick,
    selected = false,
    children,
    disableRoundCorners = false,
}) => {
    return (
        <HeadlessMenu.Item>
            {({ active }) => {
                const className = classNames(
                    parentClassName,
                    "flex justify-between !no-underline items-center p-2 gap-2",
                    {
                        "bg-tag-primary": active,
                        "!text-accent-primary dark:!text-accent-primary-dark": selected || (active && !selected),
                        "!text-text-muted-light dark:!text-text-muted-dark": !active && !selected,
                        "first:rounded-t-md last:rounded-b-md": !disableRoundCorners,
                    }
                );
                const checkIcon = <CheckIcon className={classNames("h-3 w-3", { invisible: !selected })} />;
                const renderedChildren = typeof children === "function" ? children(active) : children;
                if (href == null) {
                    return (
                        <button className={className} onClick={onClick}>
                            <div className="flex items-center space-x-2 whitespace-nowrap">{renderedChildren}</div>
                            {checkIcon}
                        </button>
                    );
                }
                return (
                    <Link className={className} href={href} onClick={onClick}>
                        <div className="flex items-center space-x-2 whitespace-nowrap">{renderedChildren}</div>
                        {checkIcon}
                    </Link>
                );
            }}
        </HeadlessMenu.Item>
    );
};
