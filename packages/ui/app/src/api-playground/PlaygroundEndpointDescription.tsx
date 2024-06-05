import { useBooleanState } from "@fern-ui/react-commons";
import cn from "clsx";
import dynamic from "next/dynamic";
import { ReactElement, useEffect, useRef, useState } from "react";
import { ResolvedEndpointDefinition } from "../resolver/types.js";

const Markdown = dynamic(() => import("../mdx/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundEndpointDescriptionProps {
    endpoint: ResolvedEndpointDefinition;
}

export function PlaygroundEndpointDescription({ endpoint }: PlaygroundEndpointDescriptionProps): ReactElement {
    const descriptionRef = useRef<HTMLDivElement>(null);
    const { value: showFullDescription, toggleValue: toggleShowFullDescription } = useBooleanState(false);
    const [descriptionIsClamped, setDescriptionIsClamped] = useState(false);

    useEffect(() => {
        const descriptionResizeObserver = new ResizeObserver(([e]) => {
            if (e != null && !showFullDescription) {
                setDescriptionIsClamped(e.target.scrollHeight > e.target.clientHeight);
            }
        });

        if (descriptionRef.current != null) {
            descriptionResizeObserver.observe(descriptionRef.current);
            return () => {
                descriptionResizeObserver.disconnect();
            };
        }
        return undefined;
    }, [showFullDescription]);
    return (
        <section className="callout-soft mt-4 hidden rounded-xl p-4" onClick={toggleShowFullDescription}>
            <div
                className={cn({
                    ["description-mask"]: !showFullDescription,
                })}
                ref={descriptionRef}
            >
                <Markdown mdx={endpoint.description} />
            </div>
            {descriptionIsClamped && (
                <div className="mt-4">
                    <a className="t-accent text-xs">{showFullDescription ? "Show less" : "Show more"}</a>
                </div>
            )}
        </section>
    );
}
