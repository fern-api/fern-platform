import { composeEventHandlers } from "@radix-ui/primitive";
import { Separator } from "@radix-ui/react-separator";
import { Slot } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { noop } from "es-toolkit/function";
import { Plus } from "lucide-react";
import {
  Children,
  ComponentPropsWithoutRef,
  Dispatch,
  Fragment,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from "react";
import { Badge } from "../badges";
import { cn } from "../cn";
import Disclosure from "../disclosure";
import { Chevron } from "./chevron";

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

const Tree = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  ({ children, ...props }, ref) => {
    return (
      <ctx.Provider
        value={{ indent: 0, pointerOver: false, setPointerOver: noop }}
      >
        <div {...props} ref={ref}>
          {children}
        </div>
      </ctx.Provider>
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

const TreeItem = forwardRef<
  HTMLDetailsElement,
  ComponentPropsWithoutRef<"details"> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ children, open: openProp, defaultOpen, onOpenChange, ...props }, ref) => {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

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
        defaultOpen={defaultOpen}
        onOpenChange={setOpen}
        data-level={indent}
      >
        {summary}
        {other.length > 0 && (
          <IndentContextProvider>
            <Disclosure.Content asChild>
              <div className="relative grid grid-cols-[16px_1fr]">{other}</div>
            </Disclosure.Content>
          </IndentContextProvider>
        )}
      </Disclosure.Details>
    </openCtx.Provider>
  );
});

TreeItem.displayName = "TreeItem";

const TreeItemContent = ({ children }: PropsWithChildren): ReactNode => {
  const indent = useIndent();

  if (indent === 0) {
    return children;
  }

  const childrenArray = Children.toArray(children);
  if (childrenArray.length === 0) {
    return false;
  }

  return (
    <>
      {childrenArray.map((child, i) => (
        <Fragment key={isValidElement(child) ? (child.key ?? i) : i}>
          <Disclosure.CloseTrigger asChild>
            <TreeBranch />
          </Disclosure.CloseTrigger>
          {child}
        </Fragment>
      ))}
    </>
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
  open,
  defaultOpen,
  onOpenChange,
}: PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>): ReactNode => {
  const indent = useIndent();
  const childrenArray = Children.toArray(children);

  if (childrenArray.length === 0) {
    return false;
  }

  return (
    <Disclosure.Details
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className="col-span-2"
    >
      <Disclosure.Summary className="list-none">
        {({ open }) =>
          !open &&
          (indent > 0 ? (
            <div className="relative grid grid-cols-[16px_1fr]">
              <Disclosure.CloseTrigger asChild>
                <TreeBranch />
              </Disclosure.CloseTrigger>
              <div className="py-2">
                <Disclosure.Trigger asChild>
                  <Badge rounded interactive variant="outlined-subtle">
                    <Plus />
                    {childrenArray.length} more attributes
                  </Badge>
                </Disclosure.Trigger>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <Disclosure.Trigger asChild>
                <Badge rounded interactive variant="outlined-subtle">
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
                <Disclosure.CloseTrigger asChild>
                  <TreeBranch />
                </Disclosure.CloseTrigger>
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
          <div className={cn("py-2", isCard && "px-4")}>{child}</div>
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
    const { open, expandable } = useDetailContext();
    return (
      <Disclosure.Summary
        {...props}
        ref={ref}
        className={cn("relative list-none items-center py-2", props.className)}
        onClick={composeEventHandlers(props.onClick, (e) => e.preventDefault())}
        tabIndex={-1}
      >
        {children}
        {!open && expandable && (
          <div className="grid grid-cols-[16px_1fr] pt-2">
            <TreeBranch />
            <div>
              <Disclosure.Trigger asChild>
                <Badge
                  rounded
                  interactive
                  className="mt-2"
                  variant="outlined-subtle"
                >
                  <Plus />
                  {collapseTriggerMessage}
                </Badge>
              </Disclosure.Trigger>
            </div>
          </div>
        )}
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
  }
>(({ lineOnly = false, ...props }, ref) => {
  const { pointerOver, setPointerOver } = useContext(ctx);
  return (
    <div
      aria-hidden="true"
      ref={ref}
      {...props}
      className={cn(props.className, "nth-last-2:hidden relative h-full")}
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
            "h-[19.5px] w-[15px] rounded-bl-[12px] border-b border-l",
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
  Indicator,
  Item,
  Root,
  Summary,
  Trigger,
  Variants,
  useDetailContext,
  useIndent,
};
