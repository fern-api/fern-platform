import { Dialog, Transition } from "@headlessui/react";
import cn from "clsx";
import { FC, Fragment, PropsWithChildren, ReactElement } from "react";
import "./index.scss";

interface FernModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export const FernModal: FC<PropsWithChildren<FernModalProps>> = ({
    isOpen,
    onClose,
    className,
    children,
}): ReactElement => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative" onClose={() => onClose()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="p-sm flex min-h-full items-center justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={cn(
                                    "overflow-hidden bg-background align-middle shadow-xl dark:border dark:border-white/20",
                                    className,
                                )}
                            >
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
