import { TooltipProvider } from "@fern-docs/components";
import { Badge, BadgeProps } from "@fern-docs/components/badges";
import { Button } from "@fern-docs/components/button";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Primitive } from "@radix-ui/react-primitive";
import { Separator } from "@radix-ui/react-separator";
import * as Toolbar from "@radix-ui/react-toolbar";
import { Link } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  MouseEventHandler,
  ReactNode,
  forwardRef,
  memo,
} from "react";
import { cn } from "../../../../components/src/cn";
import { CopyToClipboardButton } from "../../../../components/src/CopyToClipboardButton";
import { Tree } from "./tree";

const ParameterRoot = memo(
  forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Primitive.div>>(
    (props, ref) => {
      return (
        <TooltipProvider>
          <Primitive.div
            ref={ref}
            {...props}
            className={cn(
              "group/trigger flex min-w-0 gap-3 *:min-w-0",
              props.className
            )}
          />
        </TooltipProvider>
      );
    }
  )
);

ParameterRoot.displayName = "ParameterRoot";

const ParameterName = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & {
    parameterName: string;
    parameterNameDisplay?: ReactNode;
    onClickCopyAnchorLink?: MouseEventHandler<HTMLButtonElement>;
    size?: "sm" | "lg";
    children?: never;
    color?: BadgeProps["color"];
    variant?: BadgeProps["variant"];
  }
>(
  (
    {
      parameterName,
      parameterNameDisplay,
      onClickCopyAnchorLink,
      size,
      color,
      variant,
      ...props
    },
    ref
  ) => {
    const setOpen = Tree.useSetOpen();
    return (
      <CopyToClipboardButton
        ref={ref}
        {...props}
        className={cn("font-mono", props.className)}
        content={parameterName}
        asChild
        tooltipContent={
          onClickCopyAnchorLink
            ? ({ copyToClipboard, setTooltipOpen }) => (
                <Toolbar.Root
                  className="-my-2 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Toolbar.Button onClick={copyToClipboard}>
                    {"Copy to clipboard"}
                  </Toolbar.Button>
                  <Toolbar.Separator className="mx-2 w-px self-stretch bg-[var(--grayscale-a6)]" />
                  <Toolbar.Button asChild>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      className="-mx-2 rounded-l-none"
                      onClick={composeEventHandlers(
                        onClickCopyAnchorLink,
                        () => {
                          setTooltipOpen(false);
                        }
                      )}
                    >
                      <Link />
                    </Button>
                  </Toolbar.Button>
                </Toolbar.Root>
              )
            : undefined
        }
        disableTooltipProvider
      >
        <Badge
          color={color ?? "accent"}
          variant={variant ?? "ghost"}
          rounded
          interactive
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setOpen(true);
          }}
          size={size}
        >
          {parameterNameDisplay ?? parameterName}
        </Badge>
      </CopyToClipboardButton>
    );
  }
);

ParameterName.displayName = "ParameterName";

const ParameterSpacer = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>((props, ref) => {
  return (
    <Separator
      ref={ref}
      {...props}
      orientation="horizontal"
      decorative
      className={cn(
        "invisible mx-1 inline-block h-0 flex-1 self-center border-b border-dashed border-[var(--grayscale-a6)] group-hover/trigger:visible",
        props.className
      )}
    />
  );
});

ParameterSpacer.displayName = "ParameterSpacer";

const ParameterStatus = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<"span"> & {
    status: "required" | "optional";
  }
>(({ status, ...props }, ref) => {
  return (
    <span
      ref={ref}
      {...props}
      className={cn(
        "text-xs",
        status === "required"
          ? "text-[var(--accent-a9)]"
          : "text-[var(--grayscale-a9)]"
      )}
    >
      {status === "required" ? "required" : "optional"}
    </span>
  );
});

ParameterStatus.displayName = "ParameterStatus";

const Parameter = {
  Root: ParameterRoot,
  Name: ParameterName,
  Spacer: ParameterSpacer,
  Status: ParameterStatus,
};

export { Parameter };
