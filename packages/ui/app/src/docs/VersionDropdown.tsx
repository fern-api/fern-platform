import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";
import { Fragment } from "react";
import { CheckIcon } from "../commons/icons/CheckIcon";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";

export declare namespace VersionDropdown {
    export interface Props {
        versions: string[];
        selectedId: string | undefined;
        onClickVersion: (version: string) => void;
    }
}

export const VersionDropdown: React.FC<VersionDropdown.Props> = ({ versions, selectedId, onClickVersion }) => {
    return (
        <div className="flex w-32">
            <Menu as="div" className="relative inline-block text-left">
                <div className="my-auto">
                    <Menu.Button className="border-accentPrimary/30 hover:bg-accentPrimary/[0.15] text-accentPrimary group inline-flex w-full justify-center space-x-1 rounded-lg border py-1 pl-2.5 pr-1 text-xs tracking-tight hover:border-2 hover:py-[calc(0.25rem-1px)] hover:pl-[calc(0.625rem-1px)] hover:pr-[calc(0.25rem-1px)]">
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
                    <Menu.Items className="border-accentPrimary/30 absolute left-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md border bg-neutral-950 shadow-lg">
                        <div>
                            {versions.map((version, idx) => (
                                <Menu.Item key={idx}>
                                    {({ active }) => (
                                        <Link
                                            className={classNames(
                                                "flex w-full justify-between !no-underline items-center text-xs p-2",
                                                {
                                                    "bg-accentPrimary/[0.15]": active,
                                                    "!text-accentPrimary":
                                                        version === selectedId || (active && version !== selectedId),
                                                    "!text-text-muted": !active && version !== selectedId,
                                                    "rounded-t-md": idx === 0,
                                                    "rounded-b-md": idx === versions.length - 1,
                                                }
                                            )}
                                            href={`/${version}`}
                                            onClick={() => onClickVersion(version)}
                                        >
                                            <span className="font-mono">{version}</span>
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
