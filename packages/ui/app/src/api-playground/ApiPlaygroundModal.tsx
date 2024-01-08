import { APIV1Read } from "@fern-api/fdr-sdk";
import { getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { FC, ReactElement, useState } from "react";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { FernModal } from "../components/FernModal";

interface ApiPlaygroundModalProps {
    endpoint: APIV1Read.EndpointDefinition;
    package: APIV1Read.ApiDefinitionPackage;
}

export const ApiPlaygroundModal: FC<ApiPlaygroundModalProps> = ({ endpoint, package: package_ }): ReactElement => {
    console.log(endpoint);
    const [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
            >
                Open dialog
            </button>

            <FernModal
                isOpen={isOpen}
                onClose={closeModal}
                className="divide-border-default-light dark:divide-border-default-dark min-w-[1000px] divide-y rounded-lg"
            >
                <div className="flex items-stretch justify-between gap-4 p-6">
                    <div className="-m-2 flex cursor-pointer items-center gap-4 rounded p-2 hover:bg-black/10 hover:dark:bg-white/10">
                        <div className="flex flex-col justify-center">
                            {isSubpackage(package_) && (
                                <div className="text-accent-primary dark:text-accent-primary-dark text-xs">
                                    {getSubpackageTitle(package_)}
                                </div>
                            )}
                            <div className="text-lg">{endpoint.name}</div>
                        </div>
                        <ChevronDownIcon
                            className={classNames("h-5 w-5 transition", {
                                "rotate-180": false,
                            })}
                        />
                    </div>

                    <div className="flex items-center">
                        <a className="link mx-4 text-sm">Sign in to use your API keys</a>
                        <button className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/90 dark:hover:bg-accent-primary-dark/90 text-accent-primary-contrast dark:text-accent-primary-dark-contrast group flex items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                            <span className="whitespace-nowrap">Send request</span>
                            <div className="flex h-4 w-4 items-center">
                                <FontAwesomeIcon
                                    icon="paper-plane-top"
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex items-baseline px-6 py-1.5">
                    <HttpMethodTag className="mr-2" method={endpoint.method} />
                    <span className="text-sm">
                        <span className="t-muted">{endpoint.environments[0]?.baseUrl}</span>
                        {endpoint.path.parts.map((part) => (
                            <span className={classNames({ underline: part.type === "pathParameter" })}>
                                {part.value}
                            </span>
                        ))}
                    </span>
                </div>

                <div className="divide-border-default-light dark:divide-border-default-dark flex h-[500px] items-stretch divide-x">
                    <div className="flex-1">
                        <div className="w-full px-6 py-2 uppercase text-xs t-muted border-b border-border-default-light dark:border-border-default-dark">
                            Request
                        </div>
                        <div className="px-6 py-4">Endpoint content</div>
                    </div>
                    <div className="divide-border-default-light dark:divide-border-default-dark flex-col divide-y flex-1 flex">
                        <div className="flex-1">
                            <div className="w-full px-4 py-2 uppercase text-xs t-muted border-b border-border-default-light dark:border-border-default-dark">
                                Request Preview
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="w-full px-4 py-2 uppercase text-xs t-muted border-b border-border-default-light dark:border-border-default-dark">
                                Response
                            </div>
                        </div>
                    </div>
                </div>
            </FernModal>
        </>
    );
};
