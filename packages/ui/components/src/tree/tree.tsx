import { composeEventHandlers } from "@radix-ui/primitive";
import { Slot } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { noop } from "es-toolkit/function";
import { ChevronRight, Plus } from "lucide-react";
import {
    Children,
    ComponentPropsWithoutRef,
    Dispatch,
    Fragment,
    PropsWithChildren,
    ReactNode,
    createContext,
    forwardRef,
    isValidElement,
    useContext,
    useMemo,
} from "react";
import { Badge } from "../badges";
import { cn } from "../cn";
import Disclosure from "./disclosure";

const ctx = createContext(0);

function useIndent() {
    return useContext(ctx);
}

const Tree = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ children, ...props }, ref) => {
    return (
        <ctx.Provider value={0}>
            <div {...props} ref={ref}>
                {children}
            </div>
        </ctx.Provider>
    );
});

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

    const summary = childrenArray.find((child) => isValidElement(child) && child.type === TreeItemSummary);
    const other = childrenArray.filter((child) => isValidElement(child) && child.type !== TreeItemSummary);

    const indent = useIndent();
    const ctxValue = useMemo(() => ({ open, setOpen, expandable: other.length > 0 }), [open, setOpen, other.length]);

    return (
        <openCtx.Provider value={ctxValue}>
            <Disclosure.Details
                {...props}
                ref={ref}
                open={open}
                onToggle={composeEventHandlers(props.onToggle, (e) => setOpen(e.currentTarget.open))}
                data-level={indent}
            >
                {summary}
                {other.length > 0 && (
                    <ctx.Provider value={indent + 1}>
                        <Disclosure.Content className="grid grid-cols-[24px_1fr] xs:grid-cols-[32px_1fr] relative">
                            {other}
                        </Disclosure.Content>
                    </ctx.Provider>
                )}
            </Disclosure.Details>
        </openCtx.Provider>
    );
});

TreeItem.displayName = "TreeItem";

const TreeItemContent = ({ children }: PropsWithChildren): ReactNode => {
    const { setOpen } = useDetailContext();
    const childrenArray = Children.toArray(children);

    if (childrenArray.length === 0) {
        return false;
    }

    return (
        <>
            {childrenArray.map((child, i) => (
                <Fragment key={isValidElement(child) ? child.key ?? i : i}>
                    <TreeBranch onClick={() => setOpen(false)} />
                    {child}
                </Fragment>
            ))}
        </>
    );
};

const TreeItemsContentAdditional = ({
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
}: PropsWithChildren<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}>): ReactNode => {
    const [open = false, setOpen] = useControllableState({
        prop: openProp,
        defaultProp: defaultOpen,
        onChange: onOpenChange,
    });

    const childrenArray = Children.toArray(children);

    if (childrenArray.length === 0) {
        return false;
    }

    if (open) {
        return (
            <>
                {childrenArray.map((child, i) => (
                    <Fragment key={i}>
                        <TreeBranch onClick={() => setOpen(false)} />
                        {child}
                    </Fragment>
                ))}
            </>
        );
    }

    return (
        <>
            <TreeBranch />
            <div className="py-2">
                <Badge rounded interactive onClick={() => setOpen(true)} className="-ml-2" variant="outlined-subtle">
                    <Plus />
                    {childrenArray.length} more attributes
                </Badge>
            </div>
        </>
    );
};

const TreeItemSummary = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ children, ...props }, ref) => {
    const { setOpen, open, expandable } = useDetailContext();
    return (
        <Disclosure.Summary
            {...props}
            ref={ref}
            className={cn(
                "list-none relative items-center py-2",
                { "cursor-pointer": props.onClick != null },
                props.className,
            )}
            onClick={composeEventHandlers(props.onClick, (e) => e.preventDefault())}
            tabIndex={-1}
        >
            {children}
            {!open && expandable && (
                <Badge rounded interactive onClick={() => setOpen(true)} className="mt-2" variant="outlined-subtle">
                    <Plus />
                    Show child attributes
                </Badge>
            )}
        </Disclosure.Summary>
    );
});

TreeItemSummary.displayName = "TreeItemSummary";

const TreeDetailIndicator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
    ({ children, ...props }, ref) => {
        const { open, expandable } = useDetailContext();
        if (!expandable) {
            return false;
        }
        return (
            <div {...props} ref={ref}>
                <ChevronRight className={cn("transition-transform duration-100 size-4", open && "rotate-90")} />
            </div>
        );
    },
);

TreeDetailIndicator.displayName = "TreeDetailIndicator";

const TreeItemSummaryTrigger = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<"button"> & {
        asChild?: boolean;
    }
>(({ children, asChild, ...props }, ref) => {
    const { setOpen } = useContext(openCtx);
    const interactive = props.onClick != null;
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            tabIndex={interactive ? 0 : undefined}
            {...props}
            ref={ref}
            onClick={composeEventHandlers(props.onClick, () => setOpen((prev) => !prev), {
                checkForDefaultPrevented: true,
            })}
            className={cn("w-full", interactive ? "cursor-pointer" : "cursor-default", props.className)}
        >
            {children}
        </Comp>
    );
});

TreeItemSummaryTrigger.displayName = "TreeItemSummaryTrigger";

const TreeBranch = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ ...props }, ref) => {
    return (
        <div
            aria-hidden="true"
            ref={ref}
            {...props}
            className={cn(props.className, "relative h-full nth-last-2:hidden", {
                "cursor-pointer": props.onClick != null || props.onClickCapture != null,
            })}
        >
            <div className="absolute inset-0 h-full w-0 border-[var(--grayscale-6)] border-l" data-line="" />
            <div
                className="h-[20px] rounded-bl-md w-[10px] border-[var(--grayscale-6)] border-l border-b"
                data-curve=""
            />
        </div>
    );
});

TreeBranch.displayName = "TreeBranch";

export {
    Tree,
    TreeDetailIndicator,
    TreeItem,
    TreeItemContent,
    TreeItemSummary,
    TreeItemSummaryTrigger,
    TreeItemsContentAdditional,
    useDetailContext,
};
