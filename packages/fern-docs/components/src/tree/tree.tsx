import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Separator } from "@radix-ui/react-separator";
import { Slot } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { noop } from "es-toolkit/function";
import { atom, PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { Plus } from "lucide-react";
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
  useMemo,
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
}>({
  indent: 0,
  pointerOver: false,
  setPointerOver: noop,
});

function useIndent() {
  return useContext(ctx).indent;
}

const IndentContextProvider = ({ children }: PropsWithChildren) => {
  const parentIndent = useIndent();
  const [pointerOver, setPointerOver] = useState(false);

  return (
    <ctx.Provider
      value={{ indent: parentIndent + 1, pointerOver, setPointerOver }}
    >
      {children}
    </ctx.Provider>
  );
};

const Tree = forwardRef<HTMLDivElement, PropsWithChildren>(
  ({ children }, forwardRef) => {
    const ref = useRef<HTMLDivElement>(null);
    const rootId = useId();
    return (
      <div ref={composeRefs(ref, forwardRef)} className="fern-tree">
        <rootCtx.Provider
          value={useMemoOne(
            () => ({
              ref,
              rootId,
              idsAtom: atom<string[]>([]),
              expandedAtom: atom<string[]>([]),
            }),
            [rootId, ref]
          )}
        >
          <ctx.Provider
            value={{ indent: 0, pointerOver: false, setPointerOver: noop }}
          >
            {children}
          </ctx.Provider>
        </rootCtx.Provider>
      </div>
    );
  }
);

Tree.displayName = "Tree";

const openCtx = createContext<{
  open: boolean;
  expandable: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean | undefined>>;
}>({
  open: false,
  expandable: false,
  setOpen: noop,
});

function useDetailContext(): {
  open: boolean;
  expandable: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean | undefined>>;
} {
  return useContext(openCtx);
}

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

const TreeItem = forwardRef<
  HTMLDetailsElement,
  ComponentPropsWithoutRef<typeof TreeItemDisclosure> & {
    unbranched?: boolean;
  }
>(({ children, unbranched = false, ...props }, ref) => {
  const other = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type !== TreeItemSummary
  );
  const indent = useIndent();
  return (
    <UnbranchedCtx.Provider value={unbranched}>
      {other.length > 0 ? (
        <TreeItemDisclosure ref={ref} {...props}>
          {children}
        </TreeItemDisclosure>
      ) : (
        <openCtx.Provider
          value={{ open: false, expandable: false, setOpen: noop }}
        >
          <div className={props.className} data-level={indent}>
            {children}
          </div>
        </openCtx.Provider>
      )}
    </UnbranchedCtx.Provider>
  );
});

TreeItem.displayName = "TreeItem";

const TreeItemDisclosure = forwardRef<
  HTMLDetailsElement,
  ComponentPropsWithoutRef<"details"> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    asChild?: boolean;
  }
>(
  (
    { children, open: openProp, defaultOpen, onOpenChange, asChild, ...props },
    ref
  ) => {
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
      (child) => isValidElement(child) && child.type === TreeItemSummary
    );
    const other = childrenArray.filter(
      (child) => isValidElement(child) && child.type !== TreeItemSummary
    );

    const indent = useIndent();
    const ctxValue = useMemo(
      () => ({ open, setOpen, expandable: other.length > 0 }),
      [open, setOpen, other.length]
    );

    return (
      <openCtx.Provider value={ctxValue}>
        <Disclosure.Details
          {...props}
          ref={ref}
          open={open}
          onOpenChange={setOpen}
          data-level={indent}
        >
          {summary}
          {other.length > 0 && (
            <IndentContextProvider>
              <Disclosure.Content asChild={asChild}>{other}</Disclosure.Content>
            </IndentContextProvider>
          )}
        </Disclosure.Details>
      </openCtx.Provider>
    );
  }
);

TreeItemDisclosure.displayName = "TreeItemDisclosure";

const TreeItemContent = ({
  children,
  notLast = false,
}: PropsWithChildren & {
  notLast?: boolean;
}): ReactNode => {
  const indent = useIndent();
  const unbranched = useContext(UnbranchedCtx);

  if (indent === 0) {
    return children;
  }

  if (unbranched) {
    return <div className={cn(indent > 1 && "pl-2")}>{children}</div>;
  }

  const childrenArray = Children.toArray(children);
  if (childrenArray.length === 0) {
    return false;
  }

  return (
    <div className="relative grid grid-cols-[16px_1fr]">
      {childrenArray.map((child, i) => (
        <Fragment key={isValidElement(child) ? (child.key ?? i) : i}>
          <Disclosure.CloseTrigger asChild>
            <TreeBranch last={i === childrenArray.length - 1 && !notLast} />
          </Disclosure.CloseTrigger>
          {child}
        </Fragment>
      ))}
    </div>
  );
};

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
    <Comp
      {...props}
      ref={ref}
      className={cn(
        indent > 0 && "rounded-xl border border-[var(--grayscale-a6)]",
        props.className
      )}
    >
      <ctx.Provider
        value={{ indent: 0, pointerOver: false, setPointerOver: noop }}
      >
        <TreeItemCardCtx.Provider value={indent > 0}>
          {children}
        </TreeItemCardCtx.Provider>
      </ctx.Provider>
    </Comp>
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
}: PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
      className="col-span-2"
    >
      <Disclosure.Summary className="list-none" tabIndex={-1}>
        {({ open }) =>
          !open &&
          (indent > 0 ? (
            <div className="relative grid grid-cols-[16px_1fr]">
              <Disclosure.CloseTrigger asChild>
                <TreeBranch last />
              </Disclosure.CloseTrigger>
              <div className="py-2">
                <Disclosure.Trigger asChild>
                  <Badge
                    rounded
                    interactive
                    variant="outlined-subtle"
                    className="font-normal"
                  >
                    <Plus />
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
                  variant="outlined-subtle"
                  className="font-normal"
                >
                  <Plus />
                  {childrenArray.length} more attributes
                </Badge>
              </Disclosure.Trigger>
            </div>
          ))
        }
      </Disclosure.Summary>
      <Disclosure.Content>
        {indent > 0 ? (
          <div className="relative grid grid-cols-[16px_1fr]">
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
              <div className="h-px flex-1 bg-[var(--grayscale-a6)]" />
              <span className="text-sm uppercase text-[var(--grayscale-a9)]">
                {"or"}
              </span>
              <div className="h-px flex-1 bg-[var(--grayscale-a6)]" />
            </Separator>
          )}
          <div
            className={cn(
              "py-4",
              isCard && "px-4",
              !isCard && "first:pt-0 last:pb-0"
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

const TreeItemSummary = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    collapseTriggerMessage?: string;
  }
>(
  (
    { children, collapseTriggerMessage = "Show child attributes", ...props },
    ref
  ) => {
    const indent = useIndent();
    const { open, expandable } = useDetailContext();
    const unbranched = useContext(UnbranchedCtx);

    if (!expandable) {
      return (
        <div
          {...props}
          ref={ref}
          className={cn(
            "relative list-none items-center py-2",
            props.className
          )}
        >
          {children}
        </div>
      );
    }

    return (
      <Disclosure.Summary
        {...props}
        ref={ref}
        className={cn("relative list-none items-center py-2", props.className)}
        onClick={composeEventHandlers(props.onClick, (e) => e.preventDefault())}
        tabIndex={-1}
      >
        {children}
        {!open &&
          expandable &&
          (unbranched ? (
            <Disclosure.Trigger asChild>
              <Badge
                rounded
                interactive
                className={cn("mt-2 font-normal", indent > 0 && "ml-2")}
                variant="outlined-subtle"
              >
                <Plus />
                {collapseTriggerMessage}
              </Badge>
            </Disclosure.Trigger>
          ) : (
            <div className="grid grid-cols-[16px_1fr] pt-2">
              <TreeBranch last />
              <div>
                <Disclosure.Trigger asChild>
                  <Badge
                    rounded
                    interactive
                    className="mt-2 font-normal"
                    variant="outlined-subtle"
                  >
                    <Plus />
                    {collapseTriggerMessage}
                  </Badge>
                </Disclosure.Trigger>
              </div>
            </div>
          ))}
      </Disclosure.Summary>
    );
  }
);

TreeItemSummary.displayName = "TreeItemSummary";

const TreeDetailIndicator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, ...props }, ref) => {
  const { open, expandable } = useDetailContext();
  if (!expandable) {
    return false;
  }
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        props.className,
        "rounded-full transition-[transform,background] duration-100 hover:bg-[var(--grayscale-3)] hover:transition-transform",
        { "rotate-90": open }
      )}
    >
      <Chevron className="size-4" />
    </div>
  );
});

TreeDetailIndicator.displayName = "TreeDetailIndicator";

const TreeItemSummaryTrigger = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, ...props }, ref) => {
  return (
    <Disclosure.Trigger asChild>
      <div
        {...props}
        ref={ref}
        className={cn(props.className, "cursor-default")}
      >
        {children}
      </div>
    </Disclosure.Trigger>
  );
});

TreeItemSummaryTrigger.displayName = "TreeItemSummaryTrigger";

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
          "border-[var(--grayscale-6)] transition-colors duration-100":
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
              "border-[var(--grayscale-6)] transition-colors duration-100":
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

const Root = Tree;
const Item = TreeItem;
const Content = TreeItemContent;
const CollapsedContent = TreeItemsContentAdditional;
const Summary = TreeItemSummary;
const Trigger = TreeItemSummaryTrigger;
const Indicator = TreeDetailIndicator;
const Card = TreeItemCard;
const Variants = UnionVariants;
const Branch = TreeBranch;

export {
  Branch,
  Card,
  CollapsedContent,
  Content,
  HasDisclosures,
  Indicator,
  Item,
  Root,
  Summary,
  ToggleExpandAll,
  Trigger,
  useDetailContext,
  useIndent,
  Variants,
};
