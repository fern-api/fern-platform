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
  useEffect,
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

const DisclosureContext = createContext<OptionalEffectTiming>(
  defaultAnimationOptions
);

const DisclosureItemContext = createContext<{
  open: boolean;
  setDetailsEl: (el: HTMLDetailsElement | null) => void;
  setResizerEl: (el: HTMLElement | null) => void;
  setContentEl: (el: HTMLElement | null) => void;
  setSummaryRef: (el: HTMLElement | null) => void;
  setOpen: (open: boolean | undefined) => void;
  handleClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleClose: (e: React.MouseEvent<HTMLElement>) => void;
}>({
  open: false,
  setDetailsEl: noop,
  setResizerEl: noop,
  setContentEl: noop,
  setSummaryRef: noop,
  setOpen: noop,
  handleClick: noop,
  handleClose: noop,
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

const DisclosureTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const { handleClick } = useContext(DisclosureItemContext);
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      {...props}
      onClick={composeEventHandlers(props.onClick, handleClick, {
        checkForDefaultPrevented: true,
      })}
    />
  );
});

DisclosureTrigger.displayName = "DisclosureTrigger";

const DisclosureCloseTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const { handleClose } = useContext(DisclosureItemContext);
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} {...props} onClick={handleClose} />;
});

DisclosureCloseTrigger.displayName = "DisclosureCloseTrigger";

const DisclosureDetails = forwardRef<
  HTMLDetailsElement,
  ComponentPropsWithoutRef<"details"> & {
    children?: ReactNode | (({ open }: { open: boolean }) => ReactNode);
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    asChild?: boolean;
  }
>(
  (
    {
      children,
      asChild,
      open: openProp = false,
      defaultOpen,
      onOpenChange,
      ...props
    },
    forwardedRef
  ) => {
    const [open = false, setOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const detailsRef = useRef<HTMLDetailsElement | null>(null);
    const resizerRef = useRef<HTMLElement | null>(null);
    const contentRef = useRef<HTMLElement | null>(null);
    const summaryRef = useRef<HTMLElement | null>(null);

    const animate = useRef<Animation>();
    const [animationState, setAnimationState] = useState<AnimationState>(
      AnimationState.IDLE
    );

    const animationOptions = useContext(DisclosureContext);

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

      animate.current?.cancel();

      // When expanding
      if (startHeight < endHeight) {
        animate.current = contentRef.current?.animate(
          {
            height: [`${startHeight}px`, `${endHeight}px`],
            opacity: [0, 1],
          },
          animationOptions
        );
      }
      // When shrinking
      else {
        animate.current = contentRef.current?.animate(
          {
            height: [`${startHeight}px`, `${endHeight}px`],
            opacity: [1, 0],
          },
          animationOptions
        );
      }

      setOpen(open);
      if (animate.current) {
        animate.current.onfinish = () => onAnimationFinish(open);
        animate.current.oncancel = () => {
          setAnimationState(AnimationState.IDLE);
        };
      }
    };

    const handleShrink = () => {
      if (animationState === AnimationState.SHRINKING) {
        return;
      }

      setAnimationState(AnimationState.SHRINKING);

      const startHeight =
        animationState === AnimationState.IDLE
          ? (contentRef.current?.offsetHeight ?? 0)
          : (resizerRef.current?.offsetHeight ?? 0);
      const endHeight = 0;

      handleAnimateHeight({
        animationState: AnimationState.SHRINKING,
        startHeight,
        endHeight,
        open: false,
      });
    };

    const handleExpand = () => {
      if (animationState === AnimationState.EXPANDING) {
        return;
      }

      const startHeight =
        animationState === AnimationState.IDLE
          ? 0
          : (resizerRef.current?.offsetHeight ?? 0);
      const endHeight = contentRef.current?.scrollHeight ?? 0;

      handleAnimateHeight({
        animationState: AnimationState.EXPANDING,
        startHeight,
        endHeight,
        open: true,
      });
    };

    const onAnimationFinish = (open: boolean) => {
      if (detailsRef.current) {
        detailsRef.current.open = open;
      }

      if (resizerRef.current) {
        resizerRef.current.style.height = "";
        resizerRef.current.style.overflow = "";
        resizerRef.current.style.willChange = "";
      }

      if (contentRef.current) {
        contentRef.current.style.willChange = "";
      }

      animate.current = undefined;
      setAnimationState(AnimationState.IDLE);
    };

    const handleClose = () => {
      if (resizerRef.current) {
        resizerRef.current.style.overflow = "hidden";
        resizerRef.current.style.willChange = "height";
      }

      if (contentRef.current) {
        contentRef.current.style.willChange = "transform";
      }

      requestAnimationFrame(() => handleShrink());
    };

    const handleOpen = () => {
      if (resizerRef.current) {
        resizerRef.current.style.overflow = "hidden";
        resizerRef.current.style.willChange = "height";
      }

      if (contentRef.current) {
        contentRef.current.style.willChange = "transform";
      }

      if (detailsRef.current) {
        detailsRef.current.open = true;
      }

      setOpen(true);

      requestAnimationFrame(() => handleExpand());
    };

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (detailsRef.current) {
        if (
          animationState === AnimationState.SHRINKING ||
          !detailsRef.current.open
        ) {
          handleOpen();
        } else if (
          animationState === AnimationState.EXPANDING ||
          detailsRef.current.open
        ) {
          handleClose();
        }
      }
    };

    useEffect(() => {
      if (detailsRef.current) {
        if (openProp) {
          handleOpen();
        } else if (!openProp) {
          handleClose();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openProp]);

    const Comp = asChild ? Slot : "details";

    const { handleClose: handleCloseParent } = useContext(
      DisclosureItemContext
    );

    return (
      <DisclosureItemContext.Provider
        value={{
          open,
          setDetailsEl: (el) => {
            detailsRef.current = el;
          },
          setResizerEl: (el) => {
            resizerRef.current = el;
          },
          setContentEl: (el) => {
            contentRef.current = el;
          },
          setSummaryRef: (el) => {
            summaryRef.current = el;
          },
          setOpen,
          handleClick,
          handleClose: open
            ? (e) => {
                e.preventDefault();
                handleClose();
              }
            : handleCloseParent,
        }}
      >
        <Comp
          {...props}
          ref={composeRefs(forwardedRef, (div) => {
            detailsRef.current = div;
          })}
          onToggle={(e) => {
            if (e.currentTarget instanceof HTMLDetailsElement) {
              setOpen(e.currentTarget.open);
            }
          }}
        >
          {typeof children === "function" ? children({ open }) : children}
        </Comp>
      </DisclosureItemContext.Provider>
    );
  }
);

DisclosureDetails.displayName = "DisclosureDetails";

const DisclosureContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & { asChild?: boolean }
>(({ asChild, children, ...props }, forwardRef) => {
  const { setContentEl, setResizerEl } = useContext(DisclosureItemContext);
  const Comp = asChild ? Slot : "div";
  return (
    <div ref={composeRefs(forwardRef, (div) => setResizerEl(div))} {...props}>
      <Comp ref={(div) => setContentEl(div)}>{children}</Comp>
    </div>
  );
});

const DisclosureIf = ({
  children,
  open,
}: {
  children: ReactNode;
  open: boolean;
}) => {
  const { open: openContext } = useContext(DisclosureItemContext);
  return openContext === open ? children : null;
};

DisclosureContent.displayName = "DisclosureContent";

Disclosure.Root = Disclosure;
Disclosure.Details = memo(DisclosureDetails);
Disclosure.Summary = DisclosureSummary;
Disclosure.Content = DisclosureContent;
Disclosure.Trigger = DisclosureTrigger;
Disclosure.CloseTrigger = DisclosureCloseTrigger;
Disclosure.useClose = () => {
  const { handleClose } = useContext(DisclosureItemContext);
  return handleClose;
};
Disclosure.If = DisclosureIf;

export default Disclosure;
export { Disclosure };
