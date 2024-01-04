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
                        "border border-border-primary hover:border-2",
                        "transition",
                        "text-accent-primary tracking-tight",
                        "py-1 pl-2.5 pr-1",
                        // Make sure padding remains the same on hover
                        // This seems to be a Tailwind bug where we can't use theme(borderWidth.1) in some cases
                        // Current workaround is to hardcode 1px
                        "hover:py-[calc(theme(spacing.1)-1px)] hover:pr-[calc(theme(spacing[1])-1px)] hover:pl-[calc(theme(spacing[2.5])-1px)]",
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
                                    className={classNames("h-5 w-5 transition", {
                                        "rotate-180": open,
                                    })}
                                />
                            </>
                        );
                    }}
                </HeadlessMenu.Button>
                {clearSelection != null && (
                    <button
                        className="hover:bg-tag-primary border-border-primary text-accent-primary -ml-px inline-flex w-fit items-center justify-center rounded-lg rounded-l-none border px-2 py-1 tracking-tight transition hover:border-2 hover:px-[calc(theme(spacing[2])-1px)]"
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
                        "border-border-primary bg-background absolute mt-2 origin-top-right divide-y divide-gray-100 rounded-md border shadow-lg",
                        {
                            "w-32": menuClassName == null || !menuClassName.includes("w-"),
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
        href?: LinkProps["href"];
        onClick?: () => void;
        selected?: boolean;
        children: ReactNode | ((active: boolean) => ReactNode);
    }
}

export const FernMenuItem: FC<FernMenuItem.Props> = ({ href, onClick, selected = false, children }) => {
    return (
        <HeadlessMenu.Item>
            {({ active }) => {
                const className = classNames(
                    "flex w-full justify-between !no-underline items-center p-2 first:rounded-t-md last:rounded-b-md",
                    {
                        "bg-tag-primary": active,
                        "!text-accent-primary": selected || (active && !selected),
                        "!text-text-muted-light dark:!text-text-muted-dark": !active && !selected,
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
