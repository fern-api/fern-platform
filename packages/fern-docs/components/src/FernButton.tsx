import cn, { clsx } from "clsx";
import {
  ComponentProps,
  createElement,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useRef,
} from "react";
import { SemanticColor } from "./colors";
import { FaIcon } from "./fa-icon";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

export interface FernButtonSharedProps {
  className?: string;
  icon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  variant?: "minimal" | "filled" | "outlined";
  intent?: SemanticColor;
  size?: "small" | "normal" | "large";
  mono?: boolean;
  active?: boolean;
  full?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  // children replaces text
  text?: React.ReactNode;
  disableAutomaticTooltip?: boolean;
  skeleton?: boolean;
}

export interface FernButtonProps
  extends Omit<ComponentProps<"button">, "ref">,
    PropsWithChildren<FernButtonSharedProps> {}

function renderIcon(icon: string | ReactNode | undefined) {
  if (typeof icon === "string") {
    return <FaIcon icon={icon} />;
  } else {
    return icon;
  }
}

export const FernButton = forwardRef<HTMLButtonElement, FernButtonProps>(
  function FernButton(props, ref) {
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
      skeleton,
      ...buttonProps
    } = props;
    const buttonTextRef = useRef<HTMLSpanElement>(null);
    function isEllipsisActive() {
      return (
        buttonTextRef.current != null &&
        buttonTextRef.current.scrollWidth > buttonTextRef.current.clientWidth
      );
    }
    const button = (
      <button
        tabIndex={0}
        ref={ref}
        disabled={disabled || skeleton}
        data-state={active ? "on" : "off"}
        aria-disabled={disabled}
        data-selected={active}
        {...buttonProps}
        className={getButtonClassName(props)}
        onClick={
          props.onClick != null && !skeleton
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
        {createElement(ButtonContent, {
          ...props,
          buttonTextRef,
          className: skeleton ? "contents invisible" : "",
        })}
      </button>
    );

    if (
      isEllipsisActive() &&
      !disableAutomaticTooltip &&
      (children ?? text) != null
    ) {
      return (
        <FernTooltip content={children ?? text} className="line-clamp-3">
          {button}
        </FernTooltip>
      );
    } else {
      return button;
    }
  }
);

export const FernButtonGroup = forwardRef<
  HTMLSpanElement,
  ComponentProps<"div">
>(function FernButtonGroup({ className, children, ...props }, ref) {
  return (
    <FernTooltipProvider>
      <span ref={ref} className={cn(className, "fern-button-group")} {...props}>
        {children}
      </span>
    </FernTooltipProvider>
  );
});

export function ButtonContent({
  icon: leftIcon,
  rightIcon,
  mono = false,
  text,
  children,
  buttonTextRef,
  className,
}: PropsWithChildren<
  FernButtonSharedProps & {
    buttonTextRef?: React.RefObject<HTMLSpanElement>;
  }
>): ReactElement {
  children = children ?? text;
  return (
    <span className={clsx("fern-button-content", className)}>
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
