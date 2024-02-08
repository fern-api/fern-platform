import { Transition } from "@headlessui/react";
import { FC, PropsWithChildren, useRef, useState } from "react";

interface FernCollapseProps {
    isOpen?: boolean;
}

export enum AnimationStates {
    OPEN_START,
    OPEN,
    CLOSING_START,
    CLOSED,
}

export const FernCollapse: FC<PropsWithChildren<FernCollapseProps>> = ({ children, isOpen }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    return (
        <Transition
            show={isOpen}
            style={{ height }}
            className="will-change-auto"
            enter="transition-[height] ease-out overflow-y-hidden"
            enterFrom="h-0"
            leave="transition-[height] ease-in overflow-y-hidden"
            leaveTo="!h-0"
            beforeEnter={() => setHeight(ref.current?.scrollHeight)}
            afterEnter={() => setHeight(undefined)}
            beforeLeave={() => setHeight(ref.current?.scrollHeight)}
            afterLeave={() => setHeight(undefined)}
        >
            <Transition.Child
                ref={ref}
                enter="transition ease-out transform"
                enterFrom="-translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in transform"
                leaveFrom="translate-y-0 opacity-100"
                leaveTo="-translate-y-full opacity-0"
            >
                {children}
            </Transition.Child>
        </Transition>
    );
};
