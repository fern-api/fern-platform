import { composeEventHandlers } from "@radix-ui/primitive";
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
import { CopyToClipboardButton } from "../CopyToClipboardButton";
import { Button } from "../FernButtonV2";
import { Badge } from "../badges";
import { cn } from "../cn";
import { useDetailContext } from "./tree";

const ParameterDescription = memo(
  forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<"div"> & {
      parameterName: string;
      parameterNameDisplay?: ReactNode;
      typeShorthand?: ReactNode;
      required?: boolean;
      onClickCopyAnchorLink?: MouseEventHandler<HTMLButtonElement>;
    }
  >(
    (
      {
        parameterName,
        parameterNameDisplay,
        typeShorthand,
        required,
        onClickCopyAnchorLink,
        ...props
      },
      ref
    ) => {
      const { setOpen } = useDetailContext();

      return (
        <div
          ref={ref}
          {...props}
          className={cn(
            "group/trigger inline-flex items-baseline justify-start gap-3",
            props.className
          )}
        >
          <CopyToClipboardButton
            content={parameterName}
            asChild
            hideIcon
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
            delayDuration={0}
          >
            <Badge
              color="accent"
              variant="ghost"
              rounded
              interactive
              className="-mx-2 font-mono"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              {parameterNameDisplay ?? parameterName}
            </Badge>
          </CopyToClipboardButton>
          {typeShorthand && (
            <span className="text-xs text-[var(--grayscale-a9)]">
              {typeShorthand}
            </span>
          )}
          <Separator
            orientation="horizontal"
            decorative
            className="invisible mx-1 inline-block h-0 w-10 flex-1 self-center border-b border-dashed border-[var(--grayscale-a6)] group-hover/trigger:visible"
          />
          <span
            className={cn(
              "text-xs",
              required
                ? "text-[var(--accent-a9)]"
                : "text-[var(--grayscale-a9)]"
            )}
          >
            {required ? "required" : "optional"}
          </span>
        </div>
      );
    }
  )
);

ParameterDescription.displayName = "ParameterDescription";

export { ParameterDescription };
