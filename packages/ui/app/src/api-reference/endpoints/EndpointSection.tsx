import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { cn } from "@fern-ui/components";
import dynamic from "next/dynamic";
import { ComponentPropsWithoutRef, createElement, forwardRef } from "react";
import { FernAnchor } from "../../components/FernAnchor";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { useAnchorId } from "./AnchorIdParts";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

const EndpointSection = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"section">>(
    ({ children, ...props }, forwardedRef) => (
        <FernErrorBoundary component="EndpointSection">
            <section
                {...props}
                ref={forwardedRef}
                id={useAnchorId()}
                className={cn("scroll-mt-header-height-padded", props.className)}
            >
                {children}
            </section>
        </FernErrorBoundary>
    ),
);

EndpointSection.displayName = "EndpointSection";

const EndpointSectionTitle = forwardRef<
    HTMLHeadingElement,
    ComponentPropsWithoutRef<"h1"> & {
        level?: 1 | 2 | 3 | 4 | 5 | 6;
    }
>(({ level = 3, children, ...props }, forwardRef) => {
    const anchorId = useAnchorId();
    return (
        <FernAnchor href={`#${anchorId}`} asChild>
            {createElement(
                `h${level}`,
                { ...props, className: cn("relative mt-0 flex items-center mb-3", props.className), ref: forwardRef },
                children,
            )}
        </FernAnchor>
    );
});

EndpointSectionTitle.displayName = "EndpointSectionTitle";

const EndpointSectionDescription = forwardRef<
    HTMLDivElement,
    Omit<ComponentPropsWithoutRef<"div">, "children"> & {
        children: FernDocs.MarkdownText;
    }
>(({ children, ...props }, forwardRef) => {
    return <Markdown {...props} ref={forwardRef} className={cn("text-base mb-2", props.className)} mdx={children} />;
});

EndpointSectionDescription.displayName = "EndpointSectionDescription";

export { EndpointSection, EndpointSectionDescription, EndpointSectionTitle };
