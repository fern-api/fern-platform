import { Dialog, Transition } from "@headlessui/react";
import cn from "clsx";
import { FC, Fragment, PropsWithChildren, RefObject, useEffect, useRef } from "react";
import { LayoutBreakpointValue } from "../contexts/layout-breakpoint/LayoutBreakpoint";
import { useLayoutBreakpoint } from "../contexts/layout-breakpoint/useLayoutBreakpoint";

interface FeedbackFormDialogProps {
    className?: string;
    show: boolean;
    targetRef: RefObject<HTMLDivElement>;
    onClose: () => void;
}

const POPOVER_GAP = 8;

const calculateAndSetModalPosition = (modal: HTMLElement, feedback: HTMLElement, breakpoint: LayoutBreakpointValue) => {
    if (typeof window === "undefined") {
        return;
    }

    const feedbackRect = feedback.getBoundingClientRect();

    // stick to the top right corner of the feedback container
    // const bottom = window.innerHeight - feedbackRect.top + POPOVER_GAP;
    // const right = window.innerWidth - feedbackRect.right;
    // modal.style.bottom = `${bottom}px`;
    // modal.style.right = `${right}px`;

    // stick to the center top of the feedback container
    const bottom = window.innerHeight - feedbackRect.top + POPOVER_GAP;
    const left = feedbackRect.left;
    if (breakpoint === "mobile") {
        modal.style.bottom = "auto";
        modal.style.top = "60px";
        modal.style.left = "50%";
        modal.style.transform = "translateX(-50%)";
    } else {
        modal.style.top = "auto";
        modal.style.transform = "";
        modal.style.bottom = `${bottom}px`;
        modal.style.left = `${left}px`;
    }
};

export const FeedbackFormDialog: FC<PropsWithChildren<FeedbackFormDialogProps>> = ({
    className,
    show,
    children,
    targetRef,
    onClose,
}) => {
    const modalRef = useRef<HTMLDivElement>();
    const breakpoint = useLayoutBreakpoint();

    useEffect(() => {
        if (!show) {
            return;
        }

        const placeDialog = () => {
            if (modalRef.current && targetRef.current) {
                calculateAndSetModalPosition(modalRef.current, targetRef.current, breakpoint);
            }
        };

        window.addEventListener("resize", placeDialog);

        return () => {
            window.removeEventListener("resize", placeDialog);
        };
    }, [breakpoint, show, targetRef]);

    const handleModalRef = (node: HTMLDivElement | null) => {
        if (node) {
            modalRef.current = node;
            if (targetRef.current) {
                calculateAndSetModalPosition(node, targetRef.current, breakpoint);
            }
        }
    };

    return (
        <Transition as={Fragment} show={show}>
            <Dialog as="div" onClose={onClose} role="dialog">
                <Transition.Child
                    as="div"
                    ref={handleModalRef}
                    className={cn(
                        "border-default fixed z-50 w-[calc(100vw-32px)] sm:w-96 rounded-lg border bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:bg-background/50",
                        className,
                    )}
                    enter="transition-all origin-bottom-right"
                    enterFrom="opacity-0 scale-90"
                    enterTo="opacity-100 scale-100"
                    leave="transition-all"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-8"
                >
                    {children}
                </Transition.Child>
            </Dialog>
        </Transition>
    );
};
