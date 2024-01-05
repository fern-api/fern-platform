import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ReactElement, useState } from "react";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { FernModal } from "../components/FernModal";

export function ApiPlaygroundModal(): ReactElement {
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
                        <div>
                            <div className="text-accent-primary dark:text-accent-primary-dark text-xs">
                                Cloudflare Images
                            </div>
                            <div className="text-lg">Upload an image</div>
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
                    <HttpMethodTag className="mr-2" method={"POST"} />
                    <span className="text-sm">
                        https://api.cloudflare.com/client/v4/accounts/account_identifier/images/v2
                    </span>
                </div>

                <div className="divide-border-default-light dark:divide-border-default-dark flex h-[500px] items-stretch divide-x">
                    <div className="border-border-default-light dark:border-border-default-dark w-[50%] border-r"></div>
                    <div className="divide-border-default-light dark:divide-border-default-dark flex-col divide-y">
                        <div>Request</div>
                        <div>Response</div>
                    </div>
                </div>
            </FernModal>
        </>
    );
}
