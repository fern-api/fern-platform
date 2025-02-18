import { ComponentPropsWithoutRef, forwardRef } from "react";

import { composeEventHandlers } from "@radix-ui/primitive";

import { useIsHovering } from "@fern-ui/react-commons";

import { FernLogo, FernLogoFill } from "./FernLogo";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";
import { cn } from "./cn";

const BUILT_WITH_FERN_TOOLTIP_CONTENT = "Developer-friendly docs for your API";

type BuiltWithFernProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
};

export const BuiltWithFern = forwardRef<HTMLAnchorElement, BuiltWithFernProps>(
  ({ utmCampaign, utmMedium, utmSource, ...props }, ref) => {
    const {
      isHovering,
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
      onPointerOver,
    } = useIsHovering();

    const url = new URL("https://buildwithfern.com");
    if (utmCampaign) {
      url.searchParams.set("utm_campaign", utmCampaign);
    }
    if (utmMedium) {
      url.searchParams.set("utm_medium", utmMedium);
    }
    if (utmSource) {
      url.searchParams.set("utm_source", utmSource);
    }

    return (
      <FernTooltipProvider>
        <FernTooltip content={BUILT_WITH_FERN_TOOLTIP_CONTENT} side="top">
          <a
            ref={ref}
            {...props}
            href={String(url)}
            className={cn("mx-auto flex items-baseline gap-1", props.className)}
            onPointerOver={composeEventHandlers(
              props.onPointerOver,
              onPointerOver
            )}
            onPointerLeave={composeEventHandlers(
              props.onPointerLeave,
              onPointerLeave
            )}
            onPointerEnter={composeEventHandlers(
              props.onPointerEnter,
              onPointerEnter
            )}
            onPointerMove={composeEventHandlers(
              props.onPointerMove,
              onPointerMove
            )}
          >
            <span className="text-muted whitespace-nowrap text-xs">
              Built with
            </span>
            <FernLogo
              fill={isHovering ? FernLogoFill.Default : FernLogoFill.Muted}
              className="transition"
              style={{ height: 14, marginTop: -2 }}
            />
          </a>
        </FernTooltip>
      </FernTooltipProvider>
    );
  }
);

BuiltWithFern.displayName = "BuiltWithFern";
