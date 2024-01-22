import { Transition } from "@headlessui/react";
import { FC, PropsWithChildren } from "react";

interface FernCollapseProps {
    isOpen?: boolean;
}

export const FernCollapse: FC<PropsWithChildren<FernCollapseProps>> = ({ children, isOpen }) => {
    return (
        <div className="overflow-y-hidden">
            <Transition
                show={isOpen}
                enter="transition ease-out transform"
                enterFrom="-translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in transform"
                leaveFrom="translate-y-0"
                leaveTo="-translate-y-full"
            >
                {children}
            </Transition>
        </div>
    );
};
