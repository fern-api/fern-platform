import { Transition } from "@headlessui/react";
import { FC, PropsWithChildren, useRef, useState } from "react";
import "./index.scss";

interface FernCollapseProps {
    isOpen?: boolean;
    unmount?: boolean;
    className?: string;
    onOpenStart?: () => void;
    onOpenEnd?: () => void;
    onCloseStart?: () => void;
    onCloseEnd?: () => void;
}

export enum AnimationStates {
    OPEN_START,
    OPEN,
    CLOSING_START,
    CLOSED,
}

export const FernCollapse: FC<PropsWithChildren<FernCollapseProps>> = ({
    children,
    className,
    isOpen,
    unmount,
    onOpenStart,
    onOpenEnd,
    onCloseStart,
    onCloseEnd,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(isOpen ? ref.current?.scrollHeight : 0);

    return (
        <Transition
            show={isOpen}
            unmount={unmount}
            style={{ height }}
            className={className}
            enter="will-change-[height] transition-[height] ease-collapse overflow-y-hidden duration-[400ms]"
            enterFrom="!h-0"
            leave="will-change-[height] transition-[height] ease-collapse overflow-y-hidden duration-[400ms]"
            leaveTo="!h-0"
        >
            <Transition.Child
                ref={ref}
                unmount={unmount}
                enter="will-change-[transform] transition ease-collapse transform duration-[400ms]"
                enterFrom="-translate-y-full"
                enterTo="translate-y-0"
                leave="will-change-[transform] transition ease-collapse transform duration-[400ms]"
                leaveFrom="translate-y-0 opacity-100"
                leaveTo="-translate-y-full opacity-0"
                beforeEnter={() => {
                    setHeight(ref.current?.scrollHeight);
                    onOpenStart?.();
                }}
                afterEnter={() => {
                    setHeight(undefined);
                    onOpenEnd?.();
                }}
                beforeLeave={() => {
                    setHeight(ref.current?.scrollHeight);
                    onCloseStart?.();
                }}
                afterLeave={() => {
                    setHeight(0);
                    onCloseEnd?.();
                }}
            >
                {children}
            </Transition.Child>
        </Transition>
    );
};
