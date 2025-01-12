import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Primitive } from "@radix-ui/react-primitive";
import { Separator } from "@radix-ui/react-separator";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { noop } from "es-toolkit/function";
import { atom, PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, Plus } from "lucide-react";
import {
  Children,
  ComponentProps,
  ComponentPropsWithoutRef,
  createContext,
  Dispatch,
  forwardRef,
  Fragment,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMemoOne } from "use-memo-one";
import { Badge } from "../badges";
import { cn } from "../cn";
import Disclosure from "../disclosure";
import { Button } from "../FernButtonV2";
import { Chevron } from "./chevron";

const rootCtx = createContext<{
  ref: RefObject<HTMLDivElement | null>;
  rootId: string;
  idsAtom: PrimitiveAtom<string[]>;
  expandedAtom: PrimitiveAtom<string[]>;
}>({
  ref: { current: null },
  rootId: "",
  idsAtom: atom<string[]>([]),
  expandedAtom: atom<string[]>([]),
});

function RootContextProvider({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const rootId = useId();
  return (
    <rootCtx.Provider
      value={{
        ref,
        rootId,
        idsAtom: atom<string[]>([]),
        expandedAtom: atom<string[]>([]),
      }}
    >
      {children}
    </rootCtx.Provider>
  );
}

const SET_OPEN_ALL_EVENT = "tree-set-open-all-disclosures";

function useSetOpenAll() {
  const { ref, rootId } = useContext(rootCtx);
  return useCallback(
    (open: boolean) => {
      const current = ref.current;
      if (!current) {
        return;
      }
      current.dispatchEvent(
        new CustomEvent(SET_OPEN_ALL_EVENT, { detail: { rootId, open } })
      );
    },
    [rootId, ref]
  );
}

function useIsAllExpanded() {
  const { expandedAtom, idsAtom } = useContext(rootCtx);
  const expanded = useAtomValue(expandedAtom);
  const ids = useAtomValue(idsAtom);
  return expanded.length === ids.length;
}

function useHasNoDisclosures() {
  const { idsAtom } = useContext(rootCtx);
  const ids = useAtomValue(idsAtom);
  return ids.length === 0;
}

function useListenSetOpenAll(setOpen: (open: boolean) => void) {
  const { ref, rootId } = useContext(rootCtx);
  useEffect(() => {
    const current = ref.current;
    if (!current) {
      return;
    }
    const listener: EventListener = (e: Event) => {
      if (e instanceof CustomEvent && e.detail.rootId === rootId) {
        setOpen(e.detail.open);
      }
    };
    current.addEventListener(SET_OPEN_ALL_EVENT, listener);
    return () => {
      current.removeEventListener(SET_OPEN_ALL_EVENT, listener);
    };
  }, [ref, rootId, setOpen]);
}

const ctx = createContext<{
  indent: number;
  pointerOver: boolean;
  setPointerOver: Dispatch<SetStateAction<boolean>>;
  card: boolean;
}>({
  indent: 0,
  pointerOver: false,
  setPointerOver: noop,
  card: false,
});

function useIndent() {
  return useContext(ctx).indent;
}

function useIsCard() {
  return useContext(ctx).card;
}

const TreeRootProvider = ({ children }: PropsWithChildren) => {
  const card = useIsCard();
  return (
    <ctx.Provider
      value={useMemoOne(
        () => ({
          indent: 0,
          pointerOver: false,
          setPointerOver: noop,
          card,
        }),
        [card]
      )}
    >
      {children}
    </ctx.Provider>
  );
};

const SubTreeProvider = ({ children }: PropsWithChildren) => {
  const parentIndent = useIndent();
  const card = useIsCard();
  const [pointerOver, setPointerOver] = useState(false);
  return (
    <ctx.Provider
      value={{ indent: parentIndent + 1, pointerOver, setPointerOver, card }}
    >
      {children}
    </ctx.Provider>
  );
};

const Tree = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div>
>(({ children, ...props }, forwardRef) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Primitive.div
      {...props}
      ref={composeRefs(ref, forwardRef)}
      className={cn("fern-tree", props.className)}
    >
      <RootContextProvider>
        <TreeRootProvider>
          <Disclosure.Root>
            <Slottable>{children}</Slottable>
          </Disclosure.Root>
        </TreeRootProvider>
      </RootContextProvider>
    </Primitive.div>
  );
});

Tree.displayName = "Tree";

// const detailCtx = createContext<{
//   open: boolean;
//   setOpen: Dispatch<React.SetStateAction<boolean | undefined>>;
// }>({
//   open: false,
//   setOpen: noop,
// });

// function useDetailContext(): {
//   open: boolean;
//   setOpen: Dispatch<React.SetStateAction<boolean | undefined>>;
// } {
//   return useContext(detailCtx);
// }

const UnbranchedCtx = createContext(false);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useSyncDisclosureWithRoot(defaultOpen?: boolean) {
  const id = useId();
  const { idsAtom, expandedAtom } = useContext(rootCtx);
  const setIds = useSetAtom(idsAtom);
  const setExpanded = useSetAtom(expandedAtom);

  useIsomorphicLayoutEffect(() => {
    setIds((ids) => [...ids, id]);
    if (defaultOpen) {
      setExpanded((expanded) => [...expanded, id]);
    }
    return () => {
      setIds((ids) => ids.filter((id) => id !== id));
      setExpanded((expanded) => expanded.filter((id) => id !== id));
    };
  }, []);

  return useCallback(
    (open: boolean) => {
      setExpanded((expanded) =>
        open ? [...expanded, id] : expanded.filter((id) => id !== id)
      );
    },
    [id, setExpanded]
  );
}

// const TreeItemHasChildrenCtx = createContext(false);

const TreeItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div> & {
    unbranched?: boolean;
  }
>(({ children, unbranched = false, ...props }, ref) => {
  const indent = useIndent();
  return (
    <UnbranchedCtx.Provider value={unbranched}>
      <Disclosure.Reset>
        <Primitive.div ref={ref} {...props} data-level={indent}>
          {children}
        </Primitive.div>
      </Disclosure.Reset>
    </UnbranchedCtx.Provider>
  );
});

TreeItem.displayName = "TreeItem";

const TreeDisclosure = forwardRef<
  HTMLDetailsElement,
  ComponentPropsWithoutRef<"details"> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ children, open: openProp, defaultOpen, onOpenChange, ...props }, ref) => {
  const setOpenWithRoot = useSyncDisclosureWithRoot(defaultOpen);

  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: (open) => {
      setOpenWithRoot(open);
      onOpenChange?.(open);
    },
  });

  useListenSetOpenAll(setOpen);

  const childrenArray = Children.toArray(children);

  const summary = childrenArray.find(
    (child) => isValidElement(child) && child.type === DetailsSummary
  );
  const other = childrenArray.filter(
    (child) => isValidElement(child) && child.type !== DetailsSummary
  );

  return (
    <Disclosure.Details {...props} ref={ref} open={open} onOpenChange={setOpen}>
      <SubTreeProvider>
        {summary}
        <Disclosure.Content>{other}</Disclosure.Content>
      </SubTreeProvider>
    </Disclosure.Details>
  );
});

TreeDisclosure.displayName = "TreeDisclosure";

const TreeItemContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div> & {
    notLast?: boolean;
  }
>(({ children, notLast = false, ...props }, ref) => {
  const indent = useIndent();
  const unbranched = useContext(UnbranchedCtx);

  if (indent === 0) {
    return children;
  }

  if (unbranched) {
    return (
      <Primitive.div {...props} ref={ref}>
        {children}
      </Primitive.div>
    );
  }

  const childrenArray = Children.toArray(children);
  if (childrenArray.length === 0) {
    return false;
  }

  return (
    <Primitive.div
      {...props}
      ref={ref}
      className={cn(
        "relative grid grid-cols-[16px_1fr] *:min-w-0",
        props.className
      )}
      asChild={false} // no slotting allowed here
    >
      {childrenArray.map((child, i) => (
        <Fragment key={isValidElement(child) ? (child.key ?? i) : i}>
          <Disclosure.CloseTrigger asChild>
            <TreeBranch last={i === childrenArray.length - 1 && !notLast} />
          </Disclosure.CloseTrigger>
          {child}
        </Fragment>
      ))}
    </Primitive.div>
  );
});

TreeItemContent.displayName = "TreeItemContent";

const TreeItemCardCtx = createContext<boolean>(false);

const TreeItemCard = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    asChild?: boolean;
  }
>(({ children, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const indent = useIndent();
  return (
    <TreeRootProvider>
      <Comp
        {...props}
        ref={ref}
        className={cn(
          indent > 0 && "rounded-xl border border-[var(--grayscale-a4)]",
          props.className
        )}
      >
        <TreeItemCardCtx.Provider value={indent > 0}>
          <Slottable>{children}</Slottable>
        </TreeItemCardCtx.Provider>
      </Comp>
    </TreeRootProvider>
  );
});

TreeItemCard.displayName = "TreeItemCard";

const TreeItemsContentAdditional = ({
  children,
  ...props
}: ComponentProps<typeof TreeItemsContentAdditionalDisclosure>) => {
  const childrenArray = Children.toArray(children).filter(isValidElement);
  if (childrenArray.length === 0) {
    return false;
  }
  return (
    <TreeItemsContentAdditionalDisclosure {...props}>
      {children}
    </TreeItemsContentAdditionalDisclosure>
  );
};

const TreeItemsContentAdditionalDisclosure = ({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  className,
}: PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}>): ReactNode => {
  const setOpenWithRoot = useSyncDisclosureWithRoot(defaultOpen);

  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: (open) => {
      setOpenWithRoot(open);
      onOpenChange?.(open);
    },
  });

  useListenSetOpenAll(setOpen);

  const indent = useIndent();
  const childrenArray = Children.toArray(children).filter(isValidElement);

  // close the parent when this is clicked
  const onClose = Disclosure.useClose();

  return (
    <Disclosure.Details
      open={open}
      onOpenChange={setOpen}
      className={cn("col-span-2 -my-3 py-3", className)}
    >
      <Disclosure.Summary className="list-none" tabIndex={-1}>
        {({ open }) =>
          !open &&
          (indent > 0 ? (
            <div className="relative grid grid-cols-[16px_1fr] *:min-w-0">
              <Disclosure.CloseTrigger asChild>
                <TreeBranch last />
              </Disclosure.CloseTrigger>
              <div className="py-2">
                <Disclosure.Trigger asChild>
                  <Badge
                    rounded
                    interactive
                    variant="subtle"
                    className="font-normal"
                  >
                    <ChevronDown />
                    {childrenArray.length} more attributes
                  </Badge>
                </Disclosure.Trigger>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <Disclosure.Trigger asChild>
                <Badge
                  rounded
                  interactive
                  variant="subtle"
                  className="font-normal"
                >
                  <ChevronDown />
                  {childrenArray.length} more attributes
                </Badge>
              </Disclosure.Trigger>
            </div>
          ))
        }
      </Disclosure.Summary>
      <Disclosure.Content>
        {indent > 0 ? (
          <div className="relative grid grid-cols-[16px_1fr] *:min-w-0">
            {childrenArray.map((child, i) => (
              <Fragment key={i}>
                <TreeBranch
                  last={i === childrenArray.length - 1}
                  onClick={onClose}
                />
                {child}
              </Fragment>
            ))}
          </div>
        ) : (
          <>{childrenArray}</>
        )}
      </Disclosure.Content>
    </Disclosure.Details>
  );
};

export const UnionVariants = ({ children }: PropsWithChildren) => {
  const childrenArray = Children.toArray(children);
  const isCard = useContext(TreeItemCardCtx);
  return (
    <>
      {childrenArray.map((child, index) => (
        <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
          {index > 0 && (
            <Separator
              orientation="horizontal"
              className="pointer-events-none flex h-px items-center gap-2"
            >
              <div className="h-px flex-1 bg-[var(--grayscale-a4)]" />
              <span className="text-sm uppercase text-[var(--grayscale-a9)]">
                {"or"}
              </span>
              <div className="h-px flex-1 bg-[var(--grayscale-a4)]" />
            </Separator>
          )}
          <div
            className={cn(
              "py-4",
              isCard && "px-4"
              // !isCard && "first:pt-0 last:pb-0"
            )}
          >
            {child}
          </div>
        </Fragment>
      ))}
    </>
  );
};

UnionVariants.displayName = "UnionVariants";

const DetailsSummary = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    asChild?: boolean;
  }
>(({ children, ...props }, ref) => {
  return (
    <Disclosure.Summary
      {...props}
      ref={ref}
      className={cn("relative list-none items-center", props.className)}
      onClick={composeEventHandlers(props.onClick, (e) => e.preventDefault())}
      tabIndex={-1}
    >
      {children}
    </Disclosure.Summary>
  );
});

DetailsSummary.displayName = "DetailsSummary";

const DisclosureButton = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, ...props }, ref) => {
  const unbranched = useContext(UnbranchedCtx);
  return (
    <Disclosure.If open={false}>
      {unbranched ? (
        <Disclosure.Trigger asChild>
          <Badge
            rounded
            interactive
            className={cn("mt-2 font-normal", props.className)}
            variant="outlined-subtle"
            style={props.style}
          >
            <Plus />
            {children || "Show child attributes"}
          </Badge>
        </Disclosure.Trigger>
      ) : (
        <div
          {...props}
          className={cn("grid grid-cols-[16px_1fr] *:min-w-0", props.className)}
          ref={ref}
        >
          <TreeBranch last />
          <Disclosure.Trigger asChild>
            <Badge
              rounded
              interactive
              className="mt-2 w-fit font-normal"
              variant="outlined-subtle"
            >
              <Plus />
              {children || "Show child attributes"}
            </Badge>
          </Disclosure.Trigger>
        </div>
      )}
    </Disclosure.If>
  );
});

DisclosureButton.displayName = "DisclosureButton";

const TreeItemSummaryIndentedContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div>
>(({ children, ...props }, ref) => {
  const unbranched = useContext(UnbranchedCtx);

  if (unbranched) {
    return (
      <Primitive.div ref={ref} {...props}>
        {children}
      </Primitive.div>
    );
  }

  return (
    <Primitive.div
      ref={ref}
      {...props}
      className={cn("grid grid-cols-[16px_1fr] *:min-w-0", props.className)}
    >
      <TreeBranch lineOnly />
      <Slottable>{children}</Slottable>
    </Primitive.div>
  );
});

TreeItemSummaryIndentedContent.displayName = "TreeItemSummaryIndentedContent";

const TreeDetailIndicator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div>
>(({ children, ...props }, ref) => {
  const open = useIsOpen();

  return (
    <DetailsTrigger asChild>
      <Primitive.div
        {...props}
        ref={ref}
        className={cn(
          props.className,
          "rounded-full transition-[transform,background] duration-100 hover:bg-[var(--grayscale-3)] hover:transition-transform",
          { "rotate-90": open }
        )}
      >
        <Chevron className="size-4" />
        <Slottable>{children}</Slottable>
      </Primitive.div>
    </DetailsTrigger>
  );
});

TreeDetailIndicator.displayName = "TreeDetailIndicator";

// const TreeItemSummaryTrigger = forwardRef<
//   HTMLDivElement,
//   ComponentPropsWithoutRef<typeof Primitive.div>
// >(({ children, ...props }, ref) => {
//   return <Disclosure.Trigger asChild>{child}</Disclosure.Trigger>;
// });

// TreeItemSummaryTrigger.displayName = "TreeItemSummaryTrigger";

const TreeBranch = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    lineOnly?: boolean;
    last?: boolean;
  }
>(({ lineOnly = false, last = false, ...props }, ref) => {
  const { pointerOver, setPointerOver } = useContext(ctx);
  return (
    <div
      aria-hidden="true"
      ref={ref}
      {...props}
      className={cn(props.className, "relative h-full", { last })}
      data-branch=""
      onPointerOver={() => setPointerOver(true)}
      onPointerLeave={() => setPointerOver(false)}
    >
      <div
        className={cn("absolute inset-0 h-full w-0 border-l", {
          "border-[var(--grayscale-9)]": pointerOver,
          "border-[var(--grayscale-5)] transition-colors duration-100":
            !pointerOver,
        })}
        data-line=""
      />
      {!lineOnly && (
        <div
          className={cn(
            "h-[19.5px] w-[15px] rounded-bl-[8px] border-b border-l",
            {
              "border-[var(--grayscale-9)]": pointerOver,
              "border-[var(--grayscale-5)] transition-colors duration-100":
                !pointerOver,
            }
          )}
          data-curve=""
        />
      )}
    </div>
  );
});

TreeBranch.displayName = "TreeBranch";

const HasDisclosures = ({ children }: PropsWithChildren) => {
  const hasNoDisclosures = useHasNoDisclosures();
  if (hasNoDisclosures) {
    return false;
  }
  return <>{children}</>;
};

const ToggleExpandAll = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ children, ...props }, ref) => {
  const isAllExpanded = useIsAllExpanded();
  const setOpen = useSetOpenAll();
  return (
    <Button
      {...props}
      ref={ref}
      onClick={composeEventHandlers(props.onClick, () => {
        setOpen(!isAllExpanded);
      })}
      variant="ghost"
      size="xs"
      color="gray"
    >
      {isAllExpanded ? "Collapse all" : "Expand all"}
    </Button>
  );
});

ToggleExpandAll.displayName = "ToggleExpandAll";

const useIsOpen = () => {
  const openAtom = Disclosure.useState();
  const open = useAtomValue(openAtom ?? atom(false));
  return open;
};

const useSetOpen = () => {
  const openAtom = Disclosure.useState();
  const setOpen = useSetAtom(openAtom ?? atom(false));
  return setOpen;
};

const DetailsTrigger = Disclosure.Trigger;

export {
  TreeBranch as Branch,
  TreeItemCard as Card,
  TreeItemsContentAdditional as CollapsedContent,
  TreeItemContent as Content,
  TreeDisclosure as Details,
  TreeDetailIndicator as DetailsIndicator,
  DetailsSummary as DetailsSummary,
  DetailsTrigger,
  DisclosureButton as ExpandChildrenButton,
  HasDisclosures,
  TreeItem as Item,
  Tree as Root,
  TreeRootProvider as RootProvider,
  TreeItemSummaryIndentedContent as SummaryIndentedContent,
  ToggleExpandAll,
  useIndent,
  useIsCard,
  useIsOpen,
  useSetOpen,
  UnionVariants as Variants,
};
