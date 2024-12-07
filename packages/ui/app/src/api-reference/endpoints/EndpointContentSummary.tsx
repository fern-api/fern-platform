import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { AvailabilityBadge, cn } from "@fern-ui/components";
import * as Popper from "@radix-ui/react-popper";
import { Portal } from "@radix-ui/react-portal";
import { forwardRef, useEffect, useRef } from "react";
import { BgImageGradient } from "../../components/BgImageGradient";

export const EndpointContentSummary = forwardRef<
    HTMLDivElement,
    Omit<Popper.PopperContentProps, "ref" | "asChild"> & {
        context: EndpointContext;
        boundary: HTMLElement | null;
    }
>(({ context, boundary, ...rest }, ref) => {
    const { endpoint, node } = context;
    const anchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (anchorRef.current == null) {
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                console.log(entries);
            },
            {
                root: boundary,
            },
        );

        observer.observe(anchorRef.current);
        return () => observer.disconnect();
    }, [boundary]);

    return (
        <Popper.Root>
            <Popper.Anchor className="sticky top-header-height" ref={anchorRef}></Popper.Anchor>
            <Portal asChild container={boundary}>
                <Popper.Content
                    side="bottom"
                    align="center"
                    collisionBoundary={boundary}
                    {...rest}
                    className={cn(
                        "backdrop-blur-lg lg:backdrop-blur relative overflow-hidden",
                        "w-[calc(var(--radix-popper-anchor-width)+64px)]",
                        "-mx-8",
                        rest.className,
                    )}
                    ref={ref}
                >
                    <div className="clipped-background">
                        <BgImageGradient className="h-screen opacity-60 dark:opacity-80" />
                    </div>
                    <div className="mx-8 py-4 border-b border-[var(--grayscale-a5)]">
                        <span>
                            <h4 className="fern-page-heading">{node.title}</h4>
                            {endpoint.availability != null && (
                                <AvailabilityBadge
                                    availability={endpoint.availability}
                                    rounded
                                    size="sm"
                                    className="ms-1"
                                />
                            )}
                        </span>
                    </div>
                </Popper.Content>
            </Portal>
        </Popper.Root>
    );
});

EndpointContentSummary.displayName = "EndpointContentSummary";
