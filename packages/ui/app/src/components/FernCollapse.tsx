import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { FC, PropsWithChildren, useRef, useState } from "react";

interface FernCollapseProps {
    isOpen?: boolean;
    className?: string;
}

export enum AnimationStates {
    OPEN_START,
    OPEN,
    CLOSING_START,
    CLOSED,
}

export const FernCollapse: FC<PropsWithChildren<FernCollapseProps>> = ({ children, className, isOpen }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    return (
        <Transition
            show={isOpen}
            style={{ height }}
            className={classNames("will-change-[height]", className)}
            enter="transition-[height] ease-[cubic-bezier(0.87,0,0.13,1)] overflow-y-hidden duration-[400ms]"
            enterFrom="!h-0"
            leave="transition-[height] ease-[cubic-bezier(0.87,0,0.13,1)] overflow-y-hidden duration-[400ms]"
            leaveTo="!h-0"
            beforeEnter={() => setHeight(ref.current?.scrollHeight)}
            afterEnter={() => setHeight(undefined)}
            beforeLeave={() => setHeight(ref.current?.scrollHeight)}
            afterLeave={() => setHeight(undefined)}
        >
            <Transition.Child
                ref={ref}
                enter="transition ease-[cubic-bezier(0.87,0,0.13,1)] transform duration-[400ms]"
                enterFrom="-translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-[cubic-bezier(0.87,0,0.13,1)] transform duration-[400ms]"
                leaveFrom="translate-y-0 opacity-100"
                leaveTo="-translate-y-full opacity-0"
            >
                {children}
            </Transition.Child>
        </Transition>
    );
};
