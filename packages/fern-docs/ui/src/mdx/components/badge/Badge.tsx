import { SemanticColor } from "@fern-docs/components";
import {
    Badge as BadgeComponent,
    SemanticBadge,
} from "@fern-docs/components/badges";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const Badge = forwardRef<
    HTMLSpanElement & HTMLButtonElement,
    ComponentPropsWithoutRef<typeof BadgeComponent> & {
        /**
         * If undefined, the badge will default to the color specified in the `color` prop.
         */
        intent?: SemanticColor;
        minimal?: boolean;
        outlined?: boolean;
    }
>(({ intent, minimal = false, outlined = false, ...props }, ref) => {
    const variant =
        outlined && minimal
            ? "outlined-subtle"
            : outlined
              ? "outlined"
              : minimal
                ? "subtle"
                : "solid";

    if (intent == null) {
        return <BadgeComponent ref={ref} variant={variant} {...props} />;
    }

    return (
        <SemanticBadge ref={ref} intent={intent} variant={variant} {...props} />
    );
});

Badge.displayName = "Badge";
