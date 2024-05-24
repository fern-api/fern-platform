import cn from "clsx";
import { ComponentProps, forwardRef, PropsWithChildren, ReactElement, ReactNode, useRef } from "react";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";
import { RemoteFontAwesomeIcon } from "./FontAwesomeIcon";

export type Intent = "none" | "primary" | "success" | "warning" | "danger";

export interface FernButtonSharedProps {
    className?: string;
    icon?: string | ReactNode;
    rightIcon?: string | ReactNode;
    variant?: "minimal" | "filled" | "outlined";
    intent?: Intent;
    size?: "small" | "normal" | "large";
    mono?: boolean;
    active?: boolean;
    full?: boolean;
    disabled?: boolean;
    rounded?: boolean;
    // children replaces text
    text?: React.ReactNode;
    disableAutomaticTooltip?: boolean;
}

export interface FernButtonProps
    extends Omit<ComponentProps<"button">, "ref">,
        PropsWithChildren<FernButtonSharedProps> {}

function renderIcon(icon: string | ReactNode | undefined) {
    if (typeof icon === "string") {
        return <RemoteFontAwesomeIcon icon={icon} />;
    } else {
        return icon;
    }
}

export const FernButton = forwardRef<HTMLButtonElement, FernButtonProps>(function FernButton(props, ref) {
    const {
        icon,
        disabled = false,
        rightIcon,
        className,
        text,
        children,
        variant,
        size,
        mono,
        intent,
        active,
        full,
        rounded,
        disableAutomaticTooltip,
        ...buttonProps
    } = props;
    const buttonTextRef = useRef<HTMLSpanElement>(null);
    function isEllipsisActive() {
        return buttonTextRef.current != null && buttonTextRef.current.scrollWidth > buttonTextRef.current.clientWidth;
    }
    const button = (
        <button
            tabIndex={0}
            ref={ref}
            disabled={disabled}
            data-state={active ? "on" : "off"}
            aria-disabled={disabled}
            aria-selected={active}
            data-selected={active}
            {...buttonProps}
            className={getButtonClassName(props)}
            onClick={
                props.onClick != null
                    ? (e) => {
                          if (disabled) {
                              e.preventDefault();
                              e.stopPropagation();
                          } else {
                              props.onClick?.(e);
                          }
                      }
                    : undefined
            }
        >
            {renderButtonContent(props, buttonTextRef)}
        </button>
    );

    if (isEllipsisActive() && !disableAutomaticTooltip && (children ?? text) != null) {
        return (
            <FernTooltip content={children ?? text} className="line-clamp-3">
                {button}
            </FernTooltip>
        );
    } else {
        return button;
    }
});

export const FernButtonGroup = forwardRef<HTMLSpanElement, ComponentProps<"div">>(function FernButtonGroup(
    { className, children, ...props },
    ref,
) {
    return (
        <FernTooltipProvider>
            <span ref={ref} className={cn(className, "fern-button-group")} {...props}>
                {children}
            </span>
        </FernTooltipProvider>
    );
});

export function renderButtonContent(
    { icon: leftIcon, rightIcon, mono = false, text, children }: PropsWithChildren<FernButtonSharedProps>,
    buttonTextRef?: React.RefObject<HTMLSpanElement>,
): ReactElement {
    children = children ?? text;
    return (
        <span className="fern-button-content">
            {renderIcon(leftIcon)}
            {children && (
                <span
                    ref={buttonTextRef}
                    className={cn("fern-button-text", {
                        "font-mono tracking-tight": mono,
                    })}
                >
                    {children}
                </span>
            )}
            {renderIcon(rightIcon)}
        </span>
    );
}

export function getButtonClassName({
    className,
    variant = "filled",
    intent = "none",
    size = "normal",
    active = false,
    full = false,
    disabled = false,
    rounded = false,
    icon,
    rightIcon,
    text,
    children,
}: PropsWithChildren<FernButtonSharedProps>): string {
    children = children ?? text;
    return cn(className, "fern-button", variant, size, {
        [intent]: intent !== "none",
        disabled,
        active,
        "w-full": full,
        rounded,
        square: icon != null && children == null && rightIcon == null,
    });
}
