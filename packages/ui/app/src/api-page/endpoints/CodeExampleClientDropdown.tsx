import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment } from "react";
import { FontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { CheckIcon } from "../../commons/icons/CheckIcon";
import { ChevronDownIcon } from "../../commons/icons/ChevronDownIcon";
import type { CodeExampleClient, CodeExampleClientId } from "../examples//code-example";

function getIconForClient(clientId: CodeExampleClientId) {
    switch (clientId) {
        case "curl":
            return "fa-solid fa-code";
        case "python":
        case "python-async":
            return "fa-brands fa-python";
        case "typescript":
            return "fa-brands fa-js";
    }
}

export declare namespace CodeExampleClientDropdown {
    export interface Props {
        clients: CodeExampleClient[];
        selectedClient: CodeExampleClient;
        onClickClient: (clientId: CodeExampleClientId) => void;
    }
}

export const CodeExampleClientDropdown: React.FC<CodeExampleClientDropdown.Props> = ({
    clients,
    selectedClient,
    onClickClient,
}) => {
    return (
        <div className="flex justify-end">
            <Menu as="div" className="relative inline-block text-left">
                <div className="my-auto">
                    <Menu.Button
                        className={classNames(
                            "group inline-flex w-full justify-center items-center space-x-2 rounded-lg",
                            "hover:bg-tag-primary dark:hover:bg-tag-primary-dark",
                            "border border-border-primary dark:border-border-primary-dark hover:border-2",
                            "transition",
                            "text-accent-primary dark:text-accent-primary-dark tracking-tight",
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
                                    <FontAwesomeIcon className="h-4 w-4" icon={getIconForClient(selectedClient.id)} />
                                    <span className="font-mono text-xs font-normal transition-colors">
                                        {selectedClient.name}
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
                    <Menu.Items className="border-border-primary bg-background dark:bg-background-dark absolute right-0 z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md border shadow-lg">
                        <div>
                            {clients.map((v, idx) => {
                                const { id: clientId, name: clientName } = v;
                                return (
                                    <Menu.Item key={idx}>
                                        {({ active }) => (
                                            <button
                                                className={classNames(
                                                    "flex w-full !no-underline justify-between items-center p-2",
                                                    {
                                                        "bg-tag-primary": active,
                                                        "text-accent-primary dark:text-accent-primary-dark":
                                                            clientId === selectedClient.id ||
                                                            (active && clientId !== selectedClient.id),
                                                        "text-text-muted-light dark:text-text-muted-dark":
                                                            !active && clientId !== selectedClient.id,
                                                        "rounded-t-md": idx === 0,
                                                        "rounded-b-md": idx === clients.length - 1,
                                                    }
                                                )}
                                                onClick={() => onClickClient(clientId)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FontAwesomeIcon
                                                        className="h-4 w-4"
                                                        icon={getIconForClient(clientId)}
                                                    />

                                                    <div className="flex items-center whitespace-nowrap">
                                                        <span className="font-mono text-xs font-normal">
                                                            {clientName}
                                                        </span>
                                                    </div>
                                                </div>

                                                <CheckIcon
                                                    className={classNames("h-3 w-3 ml-3", {
                                                        visible: clientId === selectedClient.id,
                                                        invisible: clientId !== selectedClient.id,
                                                    })}
                                                />
                                            </button>
                                        )}
                                    </Menu.Item>
                                );
                            })}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};
