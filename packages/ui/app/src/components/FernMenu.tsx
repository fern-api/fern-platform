import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { ChevronDownIcon, Cross1Icon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link, { LinkProps } from "next/link";
import { FC, Fragment, PropsWithChildren, ReactNode } from "react";
import { Check } from "react-feather";
import { FernButton } from "./FernButton";

export declare namespace FernMenu {
    export interface Props extends PropsWithChildren {
        text: string;
        menuClassName?: string;
        icon?: ReactNode;
        align?: "left" | "right";
        clearSelection?: () => void;
        size?: "small" | "normal" | "large";
    }
}

export const FernMenu: FC<FernMenu.Props> = ({
    text,
    icon,
    menuClassName,
    align = "left",
    clearSelection,
    size,
    children,
}) => {
    return (
        <HeadlessMenu as="div" className="relative inline-block text-left">
            {({ open }) => (
                <>
                    <div className="my-auto flex">
                        <HeadlessMenu.Button
                            as={FernButton}
                            className={classNames({
                                "!rounded-r-none": clearSelection != null,
                            })}
                            icon={icon}
                            rightIcon={
                                <ChevronDownIcon
                                    className={classNames("transition-transform", {
                                        "rotate-180": open,
                                    })}
                                />
                            }
                            buttonStyle="outlined"
                            intent="primary"
                            size={size}
                            mono={true}
                        >
                            {text}
                        </HeadlessMenu.Button>
                        {clearSelection != null && (
                            <button
                                className="hover:bg-tag-primary border-border-primary dark:border-border-primary-dark text-accent-primary -ml-px inline-flex w-fit items-center justify-center rounded-lg rounded-l-none border px-2 py-1 tracking-tight transition hover:border-2 hover:px-[calc(theme(spacing[2])-1px)]"
                                onClick={clearSelection}
                            >
                                <Cross1Icon />
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
                                menuClassName,
                            )}
                        >
                            {children}
                        </HeadlessMenu.Items>
                    </Transition>
                </>
            )}
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
                    "flex justify-between !no-underline items-center p-2 first:rounded-t-md last:rounded-b-md gap-2",
                    {
                        "bg-tag-primary": active,
                        "!text-accent-primary": selected || (active && !selected),
                        "!text-text-muted-light dark:!text-text-muted-dark": !active && !selected,
                    },
                );
                const checkIcon = <Check className={classNames("size-3", { invisible: !selected })} />;
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
