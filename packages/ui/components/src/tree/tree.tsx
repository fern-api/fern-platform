import { composeEventHandlers } from "@radix-ui/primitive";
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
import { Chevron } from "./chevron";
import Disclosure from "./disclosure";

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
    return <ctx.Provider value={{ indent: parentIndent + 1, pointerOver, setPointerOver }}>{children}</ctx.Provider>;
};

const Tree = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ children, ...props }, ref) => {
    return (
        <IndentContextProvider>
            <div {...props} ref={ref}>
                {children}
            </div>
        </IndentContextProvider>
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
                    <IndentContextProvider>
                        <Disclosure.Content asChild>
                            <div className="grid grid-cols-[24px_1fr] xs:grid-cols-[32px_1fr] relative">{other}</div>
                        </Disclosure.Content>
                    </IndentContextProvider>
                )}
            </Disclosure.Details>
        </openCtx.Provider>
    );
});

TreeItem.displayName = "TreeItem";

const TreeItemContent = ({ children }: PropsWithChildren): ReactNode => {
    const childrenArray = Children.toArray(children);

    if (childrenArray.length === 0) {
        return false;
    }

    return (
        <>
            {childrenArray.map((child, i) => (
                <Fragment key={isValidElement(child) ? child.key ?? i : i}>
                    <Disclosure.CloseTrigger asChild>
                        <TreeBranch />
                    </Disclosure.CloseTrigger>
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
                            <Disclosure.CloseTrigger asChild>
                                <TreeBranch />
                            </Disclosure.CloseTrigger>
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
                            <Disclosure.CloseTrigger asChild>
                                <TreeBranch />
                            </Disclosure.CloseTrigger>
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
            className={cn("list-none relative items-center py-2", props.className)}
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
            <div
                {...props}
                ref={ref}
                className={cn(
                    props.className,
                    "transition-[transform,background] duration-100 hover:bg-[var(--grayscale-3)] rounded-full hover:transition-transform",
                    { "rotate-90": open },
                )}
            >
                <Chevron className="size-4" />
            </div>
        );
    },
);

TreeDetailIndicator.displayName = "TreeDetailIndicator";

const TreeItemSummaryTrigger = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
    ({ children, ...props }, ref) => {
        return (
            <Disclosure.Trigger asChild>
                <div {...props} ref={ref} className={cn(props.className, "cursor-default")}>
                    {children}
                </div>
            </Disclosure.Trigger>
        );
    },
);

TreeItemSummaryTrigger.displayName = "TreeItemSummaryTrigger";

const TreeBranch = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ ...props }, ref) => {
    const { pointerOver, setPointerOver } = useContext(ctx);
    return (
        <div
            aria-hidden="true"
            ref={ref}
            {...props}
            className={cn(props.className, "relative h-full nth-last-2:hidden")}
            data-branch=""
            // eslint-disable-next-line react/no-unknown-property
            onPointerOver={() => setPointerOver(true)}
            // eslint-disable-next-line react/no-unknown-property
            onPointerLeave={() => setPointerOver(false)}
        >
            <div
                className={cn("absolute inset-0 h-full w-0  border-l", {
                    "border-[var(--grayscale-9)]": pointerOver,
                    "border-[var(--grayscale-6)] transition-colors duration-100": !pointerOver,
                })}
                data-line=""
            />
            <div
                className={cn("h-[19.5px] rounded-bl-[12px] w-[15px] border-l border-b", {
                    "border-[var(--grayscale-9)]": pointerOver,
                    "border-[var(--grayscale-6)] transition-colors duration-100": !pointerOver,
                })}
                data-curve=""
            />
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

export { CollapsedContent, Content, Indicator, Item, Root, Summary, Trigger, useDetailContext };
