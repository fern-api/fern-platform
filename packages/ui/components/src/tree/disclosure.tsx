import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Slot } from "@radix-ui/react-slot";
import { noop } from "es-toolkit/function";
import React, {
    ComponentPropsWithoutRef,
    ReactNode,
    createContext,
    forwardRef,
    memo,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export interface DisclosureSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface DisclosureRootProps extends DisclosureSharedProps {
    animationOptions?: OptionalEffectTiming;
}

export interface DisclosureItemProps {
    children: React.ReactNode | (({ isOpen }: { isOpen: boolean }) => React.ReactNode);
    className?: string;
}

enum AnimationState {
    IDLE = "idle",
    EXPANDING = "expanding",
    SHRINKING = "shrinking",
}

const defaultAnimationOptions = {
    duration: 180,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};

const DisclosureContext = createContext<OptionalEffectTiming>(defaultAnimationOptions);

const DisclosureItemContext = createContext<{
    detailsEl: HTMLDetailsElement | null;
    setDetailsEl: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    contentEl: HTMLElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    detailsEl: null,
    setDetailsEl: noop,
    contentEl: null,
    setContentEl: noop,
    setIsOpen: noop,
});

const Disclosure = ({ children, animationOptions = defaultAnimationOptions }: DisclosureRootProps): React.ReactNode => {
    return (
        <DisclosureContext.Provider value={useDeepCompareMemoize(animationOptions)}>
            {children}
        </DisclosureContext.Provider>
    );
};

// Inspired by: https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
const DisclosureSummary = forwardRef<
    HTMLElement,
    ComponentPropsWithoutRef<"summary"> & {
        asChild?: boolean;
    }
>(({ children, asChild, ...props }, ref) => {
    const summaryRef = React.useRef<HTMLElement>(null);

    const [animation, setAnimation] = useState<Animation | null | undefined>(null);
    const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.IDLE);

    const animationOptions = useContext(DisclosureContext);
    const { detailsEl, contentEl, setIsOpen } = useContext(DisclosureItemContext);

    const handleAnimateHeight = ({
        animationState,
        startHeight,
        endHeight,
        open,
    }: {
        animationState: AnimationState;
        startHeight: number;
        endHeight: number;
        open: boolean;
    }) => {
        setAnimationState(animationState);

        if (animation) {
            animation.cancel();
        }

        const _animation = detailsEl?.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, animationOptions);

        setAnimation(_animation);
        setIsOpen(open);
        if (_animation) {
            _animation.onfinish = () => onAnimationFinish(open);
            _animation.oncancel = () => setAnimationState(AnimationState.IDLE);
        }
    };

    const handleShrink = () => {
        setAnimationState(AnimationState.SHRINKING);

        const startHeight = detailsEl?.offsetHeight ?? 0;
        const endHeight = (summaryRef?.current && summaryRef.current.offsetHeight) || 0;

        handleAnimateHeight({
            animationState: AnimationState.SHRINKING,
            startHeight,
            endHeight,
            open: false,
        });
    };

    const handleExpand = () => {
        const startHeight = detailsEl?.offsetHeight ?? 0;
        const endHeight = (summaryRef.current?.offsetHeight || 0) + (contentEl?.offsetHeight || 0);

        handleAnimateHeight({
            animationState: AnimationState.EXPANDING,
            startHeight,
            endHeight,
            open: true,
        });
    };

    const onAnimationFinish = (open: boolean) => {
        if (detailsEl) {
            detailsEl.open = open;
            detailsEl.style.height = "";
            detailsEl.style.overflow = "";
        }

        setAnimation(null);
        setAnimationState(AnimationState.IDLE);
    };

    const handleOpen = () => {
        if (detailsEl) {
            detailsEl.style.height = `${detailsEl?.offsetHeight}px`;
            detailsEl.open = true;
            setIsOpen(true);
        }

        requestAnimationFrame(() => handleExpand());
    };

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (detailsEl) {
            detailsEl.style.overflow = "hidden";

            if (animationState === AnimationState.SHRINKING || !detailsEl.open) {
                handleOpen();
            } else if (animationState === AnimationState.EXPANDING || detailsEl.open) {
                handleShrink();
            }
        }
    };

    const Comp = asChild ? Slot : "summary";

    return (
        <Comp
            {...props}
            onClick={composeEventHandlers(props.onClick, handleClick, {
                checkForDefaultPrevented: true,
            })}
            ref={composeRefs(summaryRef, ref)}
        >
            {children}
        </Comp>
    );
});

DisclosureSummary.displayName = "DisclosureSummary";

const DisclosureDetails = forwardRef<
    HTMLDetailsElement,
    ComponentPropsWithoutRef<"details"> & {
        children?: ReactNode | (({ isOpen }: { isOpen: boolean }) => ReactNode);
        asChild?: boolean;
    }
>(({ children, asChild, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        setDetailsEl(detailsRef.current);
    }, []);

    const ctxValue = useMemo(
        () => ({
            detailsEl,
            setDetailsEl,
            contentEl,
            setContentEl,
            setIsOpen,
        }),
        [detailsEl, contentEl, setIsOpen],
    );

    const Comp = asChild ? Slot : "details";

    return (
        <DisclosureItemContext.Provider value={ctxValue}>
            <Comp {...props} ref={composeRefs(detailsRef, ref)}>
                {typeof children === "function" ? children({ isOpen }) : children}
            </Comp>
        </DisclosureItemContext.Provider>
    );
});

DisclosureDetails.displayName = "DisclosureDetails";

const DisclosureContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div"> & { asChild?: boolean }>(
    ({ asChild, ...props }, ref) => {
        const contentRef = React.useRef<HTMLDivElement>(null);

        const { setContentEl } = useContext(DisclosureItemContext);

        useEffect(() => {
            setContentEl(contentRef.current);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const Comp = asChild ? Slot : "div";

        return <Comp ref={composeRefs(contentRef, ref)} {...props} />;
    },
);

DisclosureContent.displayName = "DisclosureContent";

Disclosure.Root = Disclosure;
Disclosure.Details = memo(DisclosureDetails);
Disclosure.Summary = DisclosureSummary;
Disclosure.Content = DisclosureContent;

export default Disclosure;
export { Disclosure };
