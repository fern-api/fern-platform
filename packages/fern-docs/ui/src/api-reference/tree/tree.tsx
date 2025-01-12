import { Badge } from "@fern-docs/components/badges";
import { Button } from "@fern-docs/components/button";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Primitive } from "@radix-ui/react-primitive";
import { Separator } from "@radix-ui/react-separator";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { debounce, noop } from "es-toolkit/function";
import { atom, useAtomValue, useSetAtom } from "jotai";
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
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMemoOne } from "use-memo-one";
import { cn } from "../../../../components/src/cn";
import Disclosure from "../../../../components/src/disclosure";
import { Chevron } from "./chevron";

const rootCtx = createContext<() => HTMLDivElement | null>(() => null);

function RootContextProvider({
  children,
  getRoot,
}: PropsWithChildren<{ getRoot: () => HTMLDivElement | null }>) {
  return <rootCtx.Provider value={getRoot}>{children}</rootCtx.Provider>;
}

function useSetOpenAll() {
  const getRoot = useContext(rootCtx);
  return useCallback(
    (open: boolean) => {
      Array.from(getRoot()?.getElementsByTagName("details") ?? []).forEach(
        (details) => {
          details.open = open;
        }
      );
    },
    [getRoot]
  );
}

function useIsAllExpanded() {
  const ref = useRef<Set<HTMLDetailsElement>>(new Set());
  const getRoot = useContext(rootCtx);
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    const root = getRoot();
    if (!root) return;

    const reload = debounce(() => {
      requestIdleCallback(() => {
        Array.from(root.getElementsByTagName("details")).forEach((detail) => {
          ref.current.add(detail);
        });

        setAllExpanded([...ref.current].every((detail) => detail.open));
      });
    }, 100);

    reload();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          reload();
        }
      });
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [getRoot]);

  return allExpanded;
}

function useHasNoDisclosures() {
  const [hasNoDisclosures, setHasNoDisclosures] = useState(true);
  const getRoot = useContext(rootCtx);

  useEffect(() => {
    const details = Array.from(
      getRoot()?.getElementsByTagName("details") ?? []
    );
    setHasNoDisclosures(details.length === 0);
  }, [getRoot]);

  return hasNoDisclosures;
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

const TreeRoot = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div>
>(({ children, ...props }, forwardRef) => {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <Primitive.div
      {...props}
      ref={composeRefs(ref, forwardRef)}
      className={cn("fern-tree", props.className)}
    >
      <RootContextProvider getRoot={() => ref.current}>
        <TreeRootProvider>
          <Disclosure.Root>
            <Slottable>{children}</Slottable>
          </Disclosure.Root>
        </TreeRootProvider>
      </RootContextProvider>
    </Primitive.div>
  );
});

TreeRoot.displayName = "Tree.Root";

const UnbranchedCtx = createContext(false);

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
  Omit<ComponentPropsWithoutRef<"details">, "children"> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    summary: ReactNode;
    children?: () => ReactNode;
    lazy?: boolean;
  }
>(
  (
    {
      summary,
      children,
      open: openProp,
      defaultOpen,
      onOpenChange,
      lazy,
      ...props
    },
    ref
  ) => {
    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    return (
      <Disclosure.Details
        {...props}
        ref={ref}
        open={open}
        onOpenChange={setOpen}
      >
        <SubTreeProvider>
          {summary}
          {lazy ? (
            <Disclosure.LazyContent className="-mx-3 px-3">
              {children}
            </Disclosure.LazyContent>
          ) : (
            <Disclosure.Content className="-mx-3 px-3">
              {children?.()}
            </Disclosure.Content>
          )}
        </SubTreeProvider>
      </Disclosure.Details>
    );
  }
);

TreeDisclosure.displayName = "TreeDisclosure";

const TreeItemContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div> & {
    notLast?: boolean;
  }
>(({ children, notLast = false, ...props }, ref) => {
  const indent = useIndent();
  const unbranched = useContext(UnbranchedCtx);
  if (unbranched || indent === 0) {
    return children;
  }

  const childrenArray = Children.toArray(children).filter((child) => !!child);
  if (childrenArray.length === 0) {
    return false;
  }

  return (
    <BranchGrid {...props} ref={ref}>
      {childrenArray.map((child, i) => (
        <Fragment key={isValidElement(child) ? (child.key ?? i) : i}>
          <Disclosure.CloseTrigger asChild>
            <TreeBranch last={i === childrenArray.length - 1 && !notLast}>
              {child}
            </TreeBranch>
          </Disclosure.CloseTrigger>
        </Fragment>
      ))}
    </BranchGrid>
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

const BranchGrid = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Primitive.div> & {
    hideBranch?: boolean;
  }
>(({ children, hideBranch = false, ...props }, ref) => {
  return (
    <Primitive.div
      ref={ref}
      {...props}
      className={cn(
        "relative *:min-w-0",
        !hideBranch && "grid grid-cols-[16px_1fr]",
        hideBranch && "[&>*:nth-child(odd)]:hidden"
      )}
    >
      {children}
    </Primitive.div>
  );
});

BranchGrid.displayName = "BranchGrid";

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
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const indent = useIndent();
  const childrenArray = Children.toArray(children).filter(isValidElement);

  // close the parent when this is clicked
  const onClose = Disclosure.useClose();

  return (
    <Disclosure.Details
      open={open}
      onOpenChange={setOpen}
      className={cn("col-span-2", className)}
    >
      <Disclosure.Summary className="list-none" tabIndex={-1}>
        {({ open }) =>
          !open &&
          (indent > 0 ? (
            <BranchGrid>
              <Disclosure.CloseTrigger asChild>
                <TreeBranch last>
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
                </TreeBranch>
              </Disclosure.CloseTrigger>
            </BranchGrid>
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
      <Disclosure.Content className="-mx-3 px-3">
        {indent > 0 ? (
          <BranchGrid>
            {childrenArray.map((child, i) => (
              <Fragment key={i}>
                <TreeBranch
                  last={i === childrenArray.length - 1}
                  onClick={onClose}
                >
                  {child}
                </TreeBranch>
              </Fragment>
            ))}
          </BranchGrid>
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
            variant="ghost"
            style={props.style}
          >
            <Plus />
            {children || "Show child attributes"}
          </Badge>
        </Disclosure.Trigger>
      ) : (
        <BranchGrid {...props} ref={ref}>
          <TreeBranch last>
            <Disclosure.Trigger asChild>
              <Badge
                rounded
                interactive
                className="mt-2 w-fit font-normal"
                variant="ghost"
              >
                <Plus />
                {children || "Show child attributes"}
              </Badge>
            </Disclosure.Trigger>
          </TreeBranch>
        </BranchGrid>
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
    <BranchGrid ref={ref} {...props}>
      <Disclosure.CloseTrigger asChild>
        <TreeBranch lineOnly>
          <Slottable>{children}</Slottable>
        </TreeBranch>
      </Disclosure.CloseTrigger>
    </BranchGrid>
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
    children: ReactNode;
  }
>(({ lineOnly = false, last = false, children, ...props }, ref) => {
  const { pointerOver, setPointerOver } = useContext(ctx);
  return (
    <>
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
      {children}
    </>
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

const Tree = {
  Branch: TreeBranch,
  Card: TreeItemCard,
  CollapsedContent: TreeItemsContentAdditional,
  Content: TreeItemContent,
  Details: TreeDisclosure,
  DetailsIndicator: TreeDetailIndicator,
  DetailsSummary,
  DetailsTrigger,
  ExpandChildrenButton: DisclosureButton,
  HasDisclosures,
  Item: TreeItem,
  Root: TreeRoot,
  RootProvider: TreeRootProvider,
  SummaryIndentedContent: TreeItemSummaryIndentedContent,
  ToggleExpandAll,
  useIndent,
  useIsCard,
  useIsOpen,
  useSetOpen,
  Variants: UnionVariants,
  BranchGrid,
};

export { Tree };
export default Tree;
