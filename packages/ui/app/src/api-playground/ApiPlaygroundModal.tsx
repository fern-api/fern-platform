import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ReactElement, useState } from "react";
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

            <FernModal isOpen={isOpen} onClose={closeModal} className="rounded-lg">
                <div className="space-between flex items-stretch gap-4 p-6">
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
                        <a className="link text-sm">Sign in to use your API keys</a>
                        <button className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/90 dark:hover:bg-accent-primary-dark/90 text-accent-primary-contrast dark:accent-primary-dark-contrast group inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors  hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                            <span className="whitespace-nowrap">Send request</span>
                            <div className="flex h-5 w-5 items-center">
                                <FontAwesomeIcon
                                    icon="paper-plane"
                                    className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </FernModal>
        </>
    );
}
