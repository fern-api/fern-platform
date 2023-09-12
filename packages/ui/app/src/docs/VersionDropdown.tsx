import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";
import { Fragment } from "react";
import { CheckIcon } from "../commons/icons/CheckIcon";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { DEFAULT_VERSION_LABEL } from "../config";

export declare namespace VersionDropdown {
    export interface Props {
        versions: string[];
        isDefaultVersion: (version: string) => boolean;
        selectedId: string | undefined;
        onClickVersion: (version: string) => void;
    }
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({
    versions,
    isDefaultVersion,
    selectedId,
    onClickVersion,
}) => {
    return (
        <div className="flex w-32">
            <Menu as="div" className="relative inline-block text-left">
                <div className="my-auto">
                    <Menu.Button
                        className={classNames(
                            "group inline-flex w-full justify-center space-x-1 rounded-lg",
                            "hover:bg-tag-primary",
                            "border border-border-primary hover:border-2",
                            "transition",
                            "text-accent-primary tracking-tight",
                            "py-1 pl-2.5 pr-1",
                            // Make sure padding remains the same on hover
                            // This seems to be a Tailwind bug where we can't use theme(borderWidth.1) in some cases
                            // Current workaround is to hardcode 1px
                            "hover:py-[calc(theme(spacing.1)-1px)] hover:pr-[calc(theme(spacing[1])-1px)] hover:pl-[calc(theme(spacing[2.5])-1px)]"
                        )}
                    >
                        {({ open }) => {
                            return (
                                <>
                                    <span className="font-mono text-sm font-normal transition-colors">
                                        {selectedId}
                                    </span>
                                    <ChevronDownIcon
                                        className={classNames("h-5 w-5 transition", {
                                            "rotate-180": open,
                                        })}
                                    />
                                </>
                            );
                        }}
                    </Menu.Button>
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
                    <Menu.Items className="border-border-primary bg-background absolute left-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md border shadow-lg">
                        <div>
                            {versions.map((version, idx) => (
                                <Menu.Item key={idx}>
                                    {({ active }) => (
                                        <Link
                                            className={classNames(
                                                "flex w-full justify-between !no-underline items-center p-2",
                                                {
                                                    "bg-tag-primary": active,
                                                    "!text-accent-primary":
                                                        version === selectedId || (active && version !== selectedId),
                                                    "!text-text-muted-light dark:!text-text-muted-dark":
                                                        !active && version !== selectedId,
                                                    "rounded-t-md": idx === 0,
                                                    "rounded-b-md": idx === versions.length - 1,
                                                }
                                            )}
                                            href={`/${version}`}
                                            onClick={() => onClickVersion(version)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm font-normal">{version}</span>
                                                {isDefaultVersion(version) ? (
                                                    <span
                                                        className={classNames(
                                                            "rounded px-1 py-0.5 text-[11px] font-normal",
                                                            {
                                                                "bg-accent-highlight":
                                                                    version === selectedId && !active,
                                                                "bg-tag-default-light dark:bg-tag-default-dark":
                                                                    version !== selectedId && !active,
                                                            }
                                                        )}
                                                    >
                                                        {DEFAULT_VERSION_LABEL}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <CheckIcon
                                                className={classNames("h-3 w-3", {
                                                    visible: version === selectedId,
                                                    invisible: version !== selectedId,
                                                })}
                                            />
                                        </Link>
                                    )}
                                </Menu.Item>
                            ))}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};
