import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { Badge, FernTooltip } from "@fern-docs/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { ComponentPropsWithoutRef, forwardRef, ReactElement } from "react";
import { Markdown } from "../mdx/Markdown";

export const Chip = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Badge> & {
    description?: FernDocs.MarkdownText | undefined;
    children: string;
  }
>(
  (
    { description = undefined, children, ...props },
    forwardedRef
  ): ReactElement => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(children);
    return (
      <FernTooltip
        open={wasJustCopied ? true : description == null ? false : undefined}
        content={
          wasJustCopied ? (
            "Copied!"
          ) : description != null ? (
            <Markdown mdx={description} className="text-xs" />
          ) : undefined
        }
      >
        <Badge
          interactive
          {...props}
          onClick={composeEventHandlers(props.onClick, copyToClipboard)}
          ref={forwardedRef}
          title={children}
        >
          <span className="truncate">{children}</span>
        </Badge>
      </FernTooltip>
    );
  }
);

Chip.displayName = "Chip";
