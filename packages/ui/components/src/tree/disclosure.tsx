import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Slot } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { noop } from "es-toolkit/function";
import React, {
    ComponentPropsWithoutRef,
    ReactNode,
    createContext,
    forwardRef,
    memo,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

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
    open: boolean;
    setDetailsEl: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    setResizerEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setSummaryRef: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>;
    handleClick: (e: React.MouseEvent<HTMLElement>) => void;
}>({
    open: false,
    setDetailsEl: noop,
    setResizerEl: noop,
    setContentEl: noop,
    setSummaryRef: noop,
    setOpen: noop,
    handleClick: noop,
});

const Disclosure = ({
    children,
    animationOptions = defaultAnimationOptions,
}: {
    children: React.ReactNode;
    animationOptions?: OptionalEffectTiming;
}): React.ReactNode => {
    return (
        <DisclosureContext.Provider value={useDeepCompareMemoize(animationOptions)}>
            {children}
        </DisclosureContext.Provider>
    );
};

// Inspired by: https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
const DisclosureSummary = forwardRef<
    HTMLElement,
    Omit<ComponentPropsWithoutRef<"summary">, "children"> & {
        asChild?: boolean;
        children?: ReactNode | (({ open }: { open: boolean }) => ReactNode);
    }
>(({ children, asChild, ...props }, ref) => {
    const { open } = useContext(DisclosureItemContext);
    const summaryRef = React.useRef<HTMLElement>(null);
    const Comp = asChild ? Slot : "summary";

    return (
        <Comp
            {...props}
            onClick={composeEventHandlers(props.onClick, (e) => e.preventDefault(), {
                checkForDefaultPrevented: true,
            })}
            ref={composeRefs(summaryRef, ref)}
        >
            {typeof children === "function" ? children({ open }) : children}
        </Comp>
    );
});

DisclosureSummary.displayName = "DisclosureSummary";

const DisclosureTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>(
    ({ asChild, ...props }, ref) => {
        const { handleClick } = useContext(DisclosureItemContext);
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                ref={ref}
                {...props}
                onClick={composeEventHandlers(props.onClick, handleClick, { checkForDefaultPrevented: true })}
            />
        );
    },
);

DisclosureTrigger.displayName = "DisclosureTrigger";

const DisclosureDetails = forwardRef<
    HTMLDetailsElement,
    ComponentPropsWithoutRef<"details"> & {
        children?: ReactNode | (({ open }: { open: boolean }) => ReactNode);
        open?: boolean;
        defaultOpen?: boolean;
        onOpenChange?: (open: boolean) => void;
        asChild?: boolean;
    }
>(({ children, asChild, open: openProp, defaultOpen, onOpenChange, ...props }, forwardedRef) => {
    const [open = false, setOpen] = useControllableState({
        prop: openProp,
        defaultProp: defaultOpen,
        onChange: onOpenChange,
    });
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [resizerEl, setResizerEl] = useState<HTMLElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
    const [_summaryRef, setSummaryRef] = useState<HTMLElement | null>(null);

    const animate1 = useRef<Animation>();
    const animate2 = useRef<Animation>();
    const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.IDLE);

    const animationOptions = useContext(DisclosureContext);

    const ctxValue = useMemo(() => {
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

            animate1.current?.cancel();
            animate2.current?.cancel();

            // When expanding
            if (startHeight < endHeight) {
                animate1.current = contentEl?.animate(
                    {
                        height: [`${startHeight}px`, `${endHeight}px`],
                        opacity: [0, 1],
                    },
                    animationOptions,
                );

                animate2.current = contentEl?.animate(
                    {
                        transform: ["translateY(-20px)", "translateY(0)"],
                    },
                    animationOptions,
                );
            }
            // When shrinking
            else {
                animate1.current = contentEl?.animate(
                    {
                        height: [`${startHeight}px`, `${endHeight}px`],
                        opacity: [1, 0],
                    },
                    animationOptions,
                );

                animate2.current = contentEl?.animate(
                    {
                        transform: ["translateY(0)", "translateY(-20px)"],
                    },
                    animationOptions,
                );
            }

            setOpen(open);
            if (animate1.current) {
                animate1.current.onfinish = () => onAnimationFinish(open);
                animate1.current.oncancel = () => {
                    animate2.current?.cancel();
                    setAnimationState(AnimationState.IDLE);
                };
            }
        };

        const handleShrink = () => {
            setAnimationState(AnimationState.SHRINKING);

            const startHeight =
                animationState === AnimationState.IDLE ? contentEl?.offsetHeight ?? 0 : resizerEl?.offsetHeight ?? 0;
            const endHeight = 0;

            handleAnimateHeight({
                animationState: AnimationState.SHRINKING,
                startHeight,
                endHeight,
                open: false,
            });
        };

        const handleExpand = () => {
            const startHeight = animationState === AnimationState.IDLE ? 0 : resizerEl?.offsetHeight ?? 0;
            const endHeight = contentEl?.offsetHeight ?? 0;

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
            }

            if (resizerEl) {
                resizerEl.style.height = "";
                resizerEl.style.overflow = "";
                resizerEl.style.willChange = "";
            }

            if (contentEl) {
                contentEl.style.willChange = "";
            }

            animate1.current = undefined;
            animate2.current = undefined;
            setAnimationState(AnimationState.IDLE);
        };

        const handleClose = () => {
            if (resizerEl) {
                resizerEl.style.willChange = "height";
            }

            if (contentEl) {
                contentEl.style.willChange = "transform";
            }

            requestAnimationFrame(() => handleShrink());
        };

        const handleOpen = () => {
            if (resizerEl) {
                resizerEl.style.height = `${resizerEl.offsetHeight}px`;
                resizerEl.style.willChange = "height";
            }

            if (contentEl) {
                contentEl.style.willChange = "transform";
            }

            if (detailsEl) {
                detailsEl.open = true;
            }

            setOpen(true);

            requestAnimationFrame(() => handleExpand());
        };

        const handleClick = (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            if (resizerEl && detailsEl) {
                resizerEl.style.overflow = "hidden";

                if (animationState === AnimationState.SHRINKING || !detailsEl.open) {
                    handleOpen();
                } else if (animationState === AnimationState.EXPANDING || detailsEl.open) {
                    handleClose();
                }
            }
        };

        return {
            open,
            setDetailsEl,
            setResizerEl,
            setContentEl,
            setSummaryRef,
            setOpen,
            handleClick,
        };
    }, [animationOptions, animationState, contentEl, detailsEl, open, resizerEl, setOpen]);

    const Comp = asChild ? Slot : "details";

    return (
        <DisclosureItemContext.Provider value={ctxValue}>
            <Comp
                {...props}
                ref={composeRefs(forwardedRef, (div) => setDetailsEl(div))}
                onToggle={(e) => {
                    setOpen(e.currentTarget.open);
                }}
            >
                {typeof children === "function" ? children({ open }) : children}
            </Comp>
        </DisclosureItemContext.Provider>
    );
});

DisclosureDetails.displayName = "DisclosureDetails";

const DisclosureContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div"> & { asChild?: boolean }>(
    ({ asChild, children, ...props }, forwardRef) => {
        const { setContentEl, setResizerEl } = useContext(DisclosureItemContext);
        const Comp = asChild ? Slot : "div";
        return (
            <div ref={composeRefs(forwardRef, (div) => setResizerEl(div))} {...props}>
                <Comp ref={(div) => setContentEl(div)}>{children}</Comp>
            </div>
        );
    },
);

DisclosureContent.displayName = "DisclosureContent";

Disclosure.Root = Disclosure;
Disclosure.Details = memo(DisclosureDetails);
Disclosure.Summary = DisclosureSummary;
Disclosure.Content = DisclosureContent;
Disclosure.Trigger = DisclosureTrigger;

export default Disclosure;
export { Disclosure };
