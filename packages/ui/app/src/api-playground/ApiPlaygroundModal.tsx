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
                        <button className="dark:text-dark inline-flex justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 dark:bg-white/20">
                            Send request
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                    >
                        Got it, thanks!
                    </button>
                </div>
            </FernModal>
        </>
    );
}
