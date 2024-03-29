import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import Link from "next/link";
import { PropsWithChildren, ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FernScrollArea } from "./FernScrollArea";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

export declare namespace FernDropdown {
    export interface ValueOption {
        type: "value";
        label?: ReactNode;
        helperText?: ReactNode;
        children?: ReactNode | ((active: boolean) => ReactNode);
        value: string;
        icon?: ReactNode;
        rightElement?: ReactNode;
        tooltip?: ReactNode;
        className?: string;
        labelClassName?: string;
        href?: string;
    }
    export interface SeparatorOption {
        type: "separator";
    }

    export type Option = ValueOption | SeparatorOption;

    export interface Props {
        options: Option[];
        onValueChange?: (value: string) => void;
        value?: string;
        onOpen?: () => void;
        usePortal?: boolean;
        side?: "top" | "right" | "bottom" | "left";
        align?: "start" | "center" | "end";
    }
}

export function FernDropdown({
    options,
    onValueChange,
    value,
    children,
    onOpen,
    usePortal = true,
    side,
    align,
}: PropsWithChildren<FernDropdown.Props>): ReactElement {
    const [isOpen, setOpen] = useState(false);
    const handleOpenChange = useCallback(
        (toOpen: boolean) => {
            setOpen(toOpen);
            if (toOpen && onOpen != null) {
                onOpen();
            }
        },
        [onOpen],
    );
    const renderDropdownContent = () => (
        <DropdownMenu.Content className="fern-dropdown" sideOffset={4} side={side} align={align}>
            <FernTooltipProvider>
                <FernScrollArea rootClassName="min-h-0 shrink" className="p-1" scrollbars="vertical">
                    <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
                        {options.map((option, idx) =>
                            option.type === "value" ? (
                                <FernDropdownItemValue key={option.value} option={option} value={value} />
                            ) : (
                                <DropdownMenu.Separator key={idx} className="bg-border-default mx-2 my-1 h-px" />
                            ),
                        )}
                    </DropdownMenu.RadioGroup>
                </FernScrollArea>
            </FernTooltipProvider>
        </DropdownMenu.Content>
    );

    return (
        <DropdownMenu.Root onOpenChange={handleOpenChange} open={isOpen} modal={true}>
            <DropdownMenu.Trigger asChild={true}>{children}</DropdownMenu.Trigger>
            {usePortal ? <DropdownMenu.Portal>{renderDropdownContent()}</DropdownMenu.Portal> : renderDropdownContent()}
        </DropdownMenu.Root>
    );
}

function FernDropdownItemValue({ option, value }: { option: FernDropdown.ValueOption; value: string | undefined }) {
    const helperTextRef = useRef<HTMLSpanElement>(null);
    const activeRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
    useEffect(() => {
        if (option.value === value) {
            activeRef.current?.scrollIntoView({ block: "center" });
        }
    }, [option.value, value]);

    const [isEllipsisActive, setIsEllipsisActive] = useState(false);
    useEffect(() => {
        if (helperTextRef.current == null) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setIsEllipsisActive(entry.target.scrollWidth > entry.target.clientWidth);
            }
        });

        observer.observe(helperTextRef.current);
        return () => {
            observer.disconnect();
        };
    });

    function renderButtonContent() {
        return (
            <>
                {value != null && (
                    <span className="fern-dropdown-item-indicator">
                        <DropdownMenu.ItemIndicator asChild={true}>
                            <CheckIcon />
                        </DropdownMenu.ItemIndicator>
                    </span>
                )}

                {option.icon && <span className="mr-2 inline-flex items-center">{option.icon}</span>}
                <span className="inline-flex items-baseline">
                    <span className={option.labelClassName}>{option.label ?? option.value}</span>
                    {option.helperText != null && (
                        <span className="ml-2 max-w-[300px] shrink truncate text-xs opacity-60" ref={helperTextRef}>
                            {option.helperText}
                        </span>
                    )}
                </span>
                <span className="ml-auto space-x-1 pl-2">
                    {option.rightElement && <span>{option.rightElement}</span>}
                    {(isEllipsisActive || (option.tooltip != null && option.tooltip !== "")) && <InfoCircledIcon />}
                </span>
            </>
        );
    }

    return (
        <FernTooltip
            content={
                !isEllipsisActive ? (
                    option.tooltip
                ) : (
                    <div className="space-y-2">
                        {option.helperText != null && <div>{option.helperText}</div>}
                        {option.tooltip != null && <div>{option.tooltip}</div>}
                    </div>
                )
            }
            side="right"
            sideOffset={8}
        >
            <div>
                <DropdownMenu.RadioItem asChild={true} value={option.value}>
                    {option.href != null ? (
                        <Link
                            ref={option.value === value ? activeRef : undefined}
                            href={option.href}
                            className={cn("fern-dropdown-item", option.className)}
                        >
                            {renderButtonContent()}
                        </Link>
                    ) : (
                        <button
                            ref={option.value === value ? activeRef : undefined}
                            className={cn("fern-dropdown-item", option.className)}
                        >
                            {renderButtonContent()}
                        </button>
                    )}
                </DropdownMenu.RadioItem>
            </div>
        </FernTooltip>
    );
}
