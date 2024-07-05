import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactElement } from "react";
import { useCloseMobileSidebar, useIsMobileSidebarOpen } from "../atoms/sidebar";
import { DesktopSidebar } from "./DesktopSidebar";

export function MobileSidebar(): ReactElement {
    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const closeMobileSidebar = useCloseMobileSidebar();

    return (
        <Transition as={Fragment} show={isMobileSidebarOpen}>
            <Dialog onClose={closeMobileSidebar} className="fixed inset-0 top-header-height-real z-20">
                <Transition.Child
                    as="div"
                    className="fixed inset-0 top-header-height-real z-auto bg-background/50"
                    enter="transition-opacity ease-linear duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                />
                <Transition.Child
                    as={Dialog.Panel}
                    className="bg-background-translucent border-concealed absolute inset-0 backdrop-blur-lg sm:w-72 sm:border-r"
                    enter="transition ease-in-out duration-300 transform"
                    enterFrom="opacity-0 sm:opacity-100 sm:translate-y-0 sm:-translate-x-full"
                    enterTo="opacity-100 translate-x-0 translate-y-0"
                    leave="transition ease-in-out duration-300 transform"
                    leaveFrom="opacity-100 translate-x-0 translate-y-0"
                    leaveTo="opacity-0 sm:opacity-100 sm:translate-y-0 sm:-translate-x-full"
                >
                    <DesktopSidebar />
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
