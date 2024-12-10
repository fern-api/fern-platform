import { composeEventHandlers } from "@radix-ui/primitive";
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
                defaultOpen={defaultOpen}
                onOpenChange={setOpen}
                data-level={indent}
            >
                {summary}
                {other.length > 0 && (
                    <ctx.Provider value={indent + 1}>
                        <Disclosure.Content asChild>
                            <div className="grid grid-cols-[24px_1fr] xs:grid-cols-[32px_1fr] relative">{other}</div>
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
    open,
    defaultOpen,
    onOpenChange,
}: PropsWithChildren<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}>): ReactNode => {
    const childrenArray = Children.toArray(children);

    if (childrenArray.length === 0) {
        return false;
    }

    return (
        <Disclosure.Details open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} className="col-span-2">
            <Disclosure.Summary className="list-none">
                {({ open }) =>
                    !open && (
                        <div className="grid grid-cols-[24px_1fr] xs:grid-cols-[32px_1fr] relative">
                            <TreeBranch />
                            <div className="py-2">
                                <Disclosure.Trigger asChild>
                                    <Badge rounded interactive className="-ml-2" variant="outlined-subtle">
                                        <Plus />
                                        {childrenArray.length} more attributes
                                    </Badge>
                                </Disclosure.Trigger>
                            </div>
                        </div>
                    )
                }
            </Disclosure.Summary>
            <Disclosure.Content>
                <div className="grid grid-cols-[24px_1fr] xs:grid-cols-[32px_1fr] relative">
                    {childrenArray.map((child, i) => (
                        <Fragment key={i}>
                            <TreeBranch />
                            {child}
                        </Fragment>
                    ))}
                </div>
            </Disclosure.Content>
        </Disclosure.Details>
    );
};

const TreeItemSummary = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ children, ...props }, ref) => {
    const { open, expandable } = useDetailContext();
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
                <Disclosure.Trigger asChild>
                    <Badge rounded interactive className="mt-2" variant="outlined-subtle">
                        <Plus />
                        Show child attributes
                    </Badge>
                </Disclosure.Trigger>
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

const TreeItemSummaryTrigger = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
    ({ children, ...props }, ref) => {
        return (
            <Disclosure.Trigger asChild>
                <div {...props} ref={ref}>
                    {children}
                </div>
            </Disclosure.Trigger>
        );
    },
);

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
            data-branch=""
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
