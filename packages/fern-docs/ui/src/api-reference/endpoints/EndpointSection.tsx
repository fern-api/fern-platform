import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Primitive } from "@radix-ui/react-primitive";
import { Separator } from "@radix-ui/react-separator";
import { Slottable } from "@radix-ui/react-slot";
import dynamic from "next/dynamic";
import {
  ComponentPropsWithoutRef,
  ReactNode,
  createElement,
  forwardRef,
  useRef,
} from "react";
import { FernAnchor } from "../../components/FernAnchor";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { useHref } from "../../hooks/useHref";
import { getAnchorId } from "../../util/anchor";

const Markdown = dynamic(
  () => import("../../mdx/Markdown").then(({ Markdown }) => Markdown),
  {
    ssr: true,
  }
);

export declare namespace EndpointSection {
  export type Props = React.PropsWithChildren<{
    headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    title: ReactNode;
    headerRight?: ReactNode;
    description?: FernDocs.MarkdownText | undefined;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
  }>;
}

export const EndpointSection = forwardRef<
  HTMLDivElement,
  Omit<ComponentPropsWithoutRef<typeof Primitive.div>, "title"> & {
    headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    title: ReactNode;
    headerRight?: ReactNode;
    description?: FernDocs.MarkdownText | undefined;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
  }
>(
  (
    {
      headerType = "h3",
      title,
      headerRight,
      description,
      anchorIdParts,
      slug,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const ref = useRef<HTMLDivElement>(null);
    const anchorId = getAnchorId(anchorIdParts);
    const href = useHref(slug, anchorId);

    return (
      <FernErrorBoundary component="EndpointSection">
        <div
          data-href={href}
          {...props}
          ref={composeRefs(forwardedRef, ref)}
          className={cn("scroll-mt-content", props.className)}
        >
          <div className="mb-3 flex items-center justify-between">
            <FernAnchor href={href}>
              {createElement(
                headerType,
                { className: "relative my-0 flex items-center" },
                title
              )}
            </FernAnchor>

            {headerRight}
          </div>
          <Markdown
            size="sm"
            className="mb-3 rounded-md bg-[var(--grayscale-a3)] p-2 px-3 last:mb-0"
            mdx={description}
            fallback={
              <Separator
                orientation="horizontal"
                className="mb-3 h-px bg-[var(--grayscale-5)] last:hidden"
              />
            }
            fallbackAsChild
          />
          <Slottable>{children}</Slottable>
        </div>
      </FernErrorBoundary>
    );
  }
);

EndpointSection.displayName = "EndpointSection";
