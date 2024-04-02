import clsx from "clsx";
import { ReactElement, ReactNode } from "react";
import { FernButton, FernLinkButton } from "../../components/FernButton";

export declare namespace Button {
    export interface Props {
        className?: string;
        icon?: string | ReactNode;
        rightIcon?: string | ReactNode;
        minimal?: boolean;
        outlined?: boolean;
        mono?: boolean;
        full?: boolean;
        rounded?: boolean;
        active?: boolean;
        disabled?: boolean;
        large?: boolean;
        intent?: "none" | "primary" | "success" | "warning" | "danger";
        text?: ReactNode;
        href?: string;
    }
}

export function Button({ minimal, outlined, large, href, className, ...props }: Button.Props): ReactElement {
    const variant = outlined ? "outlined" : minimal ? "minimal" : "filled";
    const size = large ? "large" : "normal";
    if (href != null) {
        return (
            <FernLinkButton
                href={href}
                {...props}
                variant={variant}
                size={size}
                className={clsx(className, "not-prose")}
            />
        );
    }

    return <FernButton {...props} variant={variant} size={size} className={clsx(className, "not-prose")} />;
}
