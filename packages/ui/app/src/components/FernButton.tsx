import classNames from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps, FC, ReactNode } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";

interface FernButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    icon?: string | ReactNode;
    rightIcon?: string | ReactNode;
    minimal?: boolean;
    intent?: "none" | "primary" | "success" | "danger";
    small?: boolean;
    mono?: boolean;
    active?: boolean;
    full?: boolean;
    disabled?: boolean;
}
export const FernButton: FC<FernButtonProps> = ({
    icon: leftIcon,
    rightIcon,
    className,
    children,
    minimal = false,
    intent = "none",
    small = false,
    mono = false,
    active = false,
    full = false,
    disabled = false,
    ...props
}) => {
    function renderIcon(icon: string | ReactNode | undefined) {
        if (typeof icon === "string") {
            return (
                <RemoteFontAwesomeIcon
                    icon={icon}
                    className={classNames("h-4 w-4", {
                        "bg-accent-primary dark:bg-accent-primary-dark": intent === "primary",
                        "bg-text-primary-light/60 dark:bg-text-primary-dark/60": intent === "none",
                        "bg-intent-success-light dark:bg-intent-success-dark": intent === "success",
                        "bg-intent-danger-light dark:bg-intent-danger-dark": intent === "danger",
                    })}
                />
            );
        } else {
            return icon;
        }
    }

    return (
        <button
            {...props}
            className={classNames(
                className,
                "fern-button transition-shadow hover:transition-[background] text-center align-middle",
                {
                    "rounded-md": small && !className?.includes("rounded"),
                    "rounded-lg": !small && !className?.includes("rounded"),
                    "px-2 py-1 text-xs h-6": small,
                    "px-3.5 py-1.5 text-sm h-9": !small,
                    "border ring-0": !minimal,
                    "hover:ring-2": !minimal && !disabled,
                    "border-border-primary dark:border-border-primary-dark ring-border-primary/10 dark:ring-border-primary-dark/10":
                        !minimal && intent === "primary",
                    "ring-text-primary dark:ring-text-primary-dark": !minimal && intent === "none",
                    "ring-intent-success-light dark:ring-intent-success-dark": !minimal && intent === "success",
                    "ring-intent-danger-light dark:ring-intent-danger-dark": !minimal && intent === "danger",
                    "text-accent-primary dark:text-accent-primary-dark": intent === "primary",
                    "hover:bg-tag-primary": (intent === "primary" || intent === "none") && !disabled,
                    "bg-transparent dark:bg-transparent-dark text-text-primary-light/60 dark:text-text-primary-dark/60":
                        intent === "none",
                    "text-intent-success-light dark:text-intent-success-dark": intent === "success",
                    "hover:bg-tag-success": intent === "success" && !disabled,
                    "text-intent-danger-light dark:text-intent-danger-dark": intent === "danger",
                    "hover:bg-tag-danger": intent === "danger" && !disabled,
                    "bg-tag-primary": intent === "primary" && active,
                    "bg-tag-success": intent === "success" && active,
                    "bg-tag-danger": intent === "danger" && active,
                    "w-full": full,
                    "cursor-not-allowed opacity-70": disabled,
                },
            )}
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
            <span
                className={classNames("inline-flex items-center", {
                    "gap-1": small,
                    "h-[14px]": small && !minimal,
                    "h-4": small && minimal,
                    "gap-1.5": !small,
                    "h-[22px]": !small && !minimal,
                    "h-6": !small && minimal,
                })}
            >
                {renderIcon(leftIcon)}
                <span
                    className={classNames({
                        "font-mono tracking-tight": mono,
                    })}
                >
                    {children}
                </span>
                {renderIcon(rightIcon)}
            </span>
        </button>
    );
};
