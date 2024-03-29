import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import * as Tabs from "@radix-ui/react-tabs";
import { clsx as cn } from "clsx";
import { PropsWithChildren, ReactNode, forwardRef, memo, useMemo, useState } from "react";
import { HorizontalOverflowMask } from "../commons/HorizontalOverflowMask";
import { CopyToClipboardButton } from "../syntax-highlighting/CopyToClipboardButton";
import { FernSyntaxHighlighter, FernSyntaxHighlighterProps } from "../syntax-highlighting/FernSyntaxHighlighter";
import "./FernCodeGroup.scss";

export declare namespace FernCodeGroup {
    export interface Item extends FernSyntaxHighlighterProps {
        title?: ReactNode;
    }

    export interface SingleItemProps extends Item {
        actions?: React.ReactNode;
        intent?: "none" | "primary" | "warning" | "danger" | "success";
    }

    export interface Props {
        className?: string;
        items: Item[];
        actions?: React.ReactNode;
        selectedTabIndex?: number;
        setSelectedTabIndex?: (index: number) => void;
        intent?: "none" | "primary" | "warning" | "danger" | "success";
    }
}

const FernCodeGroupInner = forwardRef<HTMLDivElement, PropsWithChildren<FernCodeGroup.Props>>((props, ref) => {
    const { items, className, actions, intent } = props;
    const [uncontrolledSelectedTabIndex, uncontrolledSetSelectedTabIndex] = useState(props.selectedTabIndex ?? 0);

    const setSelectedTabIndex = props.setSelectedTabIndex ?? uncontrolledSetSelectedTabIndex;
    const selectedTabIndex = props.selectedTabIndex ?? uncontrolledSelectedTabIndex;

    if (items.length === 0) {
        return null;
    }

    if (items.length === 1) {
        const firstItem = items[0];

        if (firstItem.title == null) {
            return (
                <div className={cn("fern-code-group", className)} ref={ref}>
                    <FernSyntaxHighlighter {...firstItem} className={cn("fern-code-group-body", firstItem.className)} />
                    <CopyToClipboardButton className="floating" content={firstItem.code} />
                </div>
            );
        }

        return (
            <div className={cn("fern-code-group", className)} ref={ref}>
                <div className="fern-code-group-header">
                    <HorizontalOverflowMask>
                        <div className="flex items-center px-3 py-1.5">
                            {typeof firstItem.title === "string" ? (
                                <span className="t-muted text-sm font-semibold">{firstItem.title}</span>
                            ) : (
                                firstItem.title
                            )}
                        </div>
                    </HorizontalOverflowMask>
                    <div className="flex items-center gap-2 px-2">
                        {actions}
                        <CopyToClipboardButton content={firstItem.code} />
                    </div>
                </div>
                <FernSyntaxHighlighter {...firstItem} className="fern-code-group-body" />
            </div>
        );
    }

    const untitledLanguageMap: Record<string, number> = {};

    function getFallbackTitle(language: string): string {
        const count = untitledLanguageMap[language] ?? 0;
        untitledLanguageMap[language] = count + 1;
        return `${language}${count > 0 ? ` (${count})` : ""}`;
    }

    return (
        <Tabs.Root
            className={cn("fern-code-group", className)}
            onValueChange={(value) => setSelectedTabIndex(parseInt(value, 10))}
            defaultValue="0"
            ref={ref}
        >
            <div
                className={cn("fern-code-group-header", {
                    "t-primary bg-tag-primary": intent === "primary",
                    "t-warning bg-tag-default": intent === "warning",
                    "t-danger bg-tag-default": intent === "danger",
                    "t-success bg-tag-default": intent === "success",
                })}
            >
                <Tabs.List asChild>
                    <HorizontalOverflowMask>
                        {items.map((item, idx) => {
                            const tabTitle = item.title ? item.title : getFallbackTitle(item.language);
                            return (
                                <Tabs.Trigger key={idx} value={idx.toString()} className="fern-code-group-tab-trigger">
                                    <span className="fern-code-group-tab-trigger-content">
                                        <span className="absolute">{tabTitle}</span>
                                        <span className="invisible">{tabTitle}</span>
                                    </span>
                                </Tabs.Trigger>
                            );
                        })}
                    </HorizontalOverflowMask>
                </Tabs.List>
                <div className="flex items-center gap-2 px-2">
                    {actions}
                    <CopyToClipboardButton content={items[selectedTabIndex]?.code} />
                </div>
            </div>
            {items.map((item, idx) => (
                <Tabs.Content value={idx.toString()} key={idx} className="fern-code-group-body" asChild>
                    <FernSyntaxHighlighter {...item} />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
});

FernCodeGroupInner.displayName = "FernCodeGroup";

export const FernCodeGroup = memo(FernCodeGroupInner);

export const FernCodeBlock = forwardRef<HTMLDivElement, FernCodeGroup.SingleItemProps>(
    ({ className, viewportRef, actions, intent, ...props }, ref) => {
        const memoizedProps = useDeepCompareMemoize(props);
        const items = useMemo(
            (): FernCodeGroup.Item[] => [{ ...memoizedProps, viewportRef }],
            [memoizedProps, viewportRef],
        );
        return <FernCodeGroup className={className} items={items} ref={ref} actions={actions} intent={intent} />;
    },
);

FernCodeBlock.displayName = "FernCodeBlock";
