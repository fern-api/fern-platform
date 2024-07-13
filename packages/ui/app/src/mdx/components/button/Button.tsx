import { FernButton, FernButtonGroup } from "@fern-ui/components";
import clsx from "clsx";
import { ComponentProps, ReactElement, ReactNode } from "react";
import { FernLinkButton } from "../../../components/FernLinkButton";

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

export function ButtonGroup({ className, ...props }: ComponentProps<typeof FernButtonGroup>): ReactElement {
    return (
        <div className={clsx(className, "mb-6 mt-4")}>
            <FernButtonGroup {...props} />
        </div>
    );
}
