import { FernNavigation } from "@fern-api/fdr-sdk";
import dynamic from "next/dynamic";
import { ReactNode, createElement, useRef } from "react";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { useHref } from "../../hooks/useHref";
import type { BundledMDX } from "../../mdx/types";
import { getAnchorId } from "../../util/anchor";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        title: ReactNode;
        description?: BundledMDX | undefined;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({
    headerType = "h3",
    title,
    description,
    anchorIdParts,
    slug,
    children,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const anchorId = getAnchorId(anchorIdParts);
    const href = useHref(slug, anchorId);
    return (
        <FernErrorBoundary component="EndpointSection">
            <div ref={ref} id={href} className="scroll-mt-content">
                <div className="group/anchor-container relative flex items-baseline justify-between gap-4 pb-3">
                    {createElement(
                        headerType,
                        { className: "relative mt-0 flex items-center" },
                        <AbsolutelyPositionedAnchor href={href} />,
                        <span>{title}</span>,
                    )}
                </div>
                {description != null && (
                    <div className="mb-2">
                        <Markdown className="text-base" mdx={description} />
                    </div>
                )}
                {children}
            </div>
        </FernErrorBoundary>
    );
};
