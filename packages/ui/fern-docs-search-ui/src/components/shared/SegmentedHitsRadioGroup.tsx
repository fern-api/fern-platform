import { useDeepCompareEffect } from "@/hooks/useDeepCompareEffect";
import { useEventCallback } from "@/hooks/useEventCallback";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { last } from "es-toolkit/array";
import { ReactElement, ReactNode, RefObject, useEffect, useState } from "react";

export function SegmentedHitsRadioGroup({
    paths,
    segmentsIndices = [],
    children,
    inputRef,
}: {
    paths: string[];
    /**
     * An array of objects that contain a segment and an index.
     * The segment is the name of the segment that the hit belongs to.
     * The index is the index of the hit in the paths array.
     */
    segmentsIndices?: { segment: string; index: number }[];
    children: ReactNode;
    inputRef: RefObject<HTMLInputElement>;
}): ReactElement {
    const [selectedPath, setSelectedPath] = useState((): string | undefined => paths[0]);

    // fall back to the first objectID if the selectedObjectID is not in the paths
    const value = selectedPath != null && paths.includes(selectedPath) ? selectedPath : paths[0];

    // reset the selectedObjectID to the first objectID when the paths change
    useDeepCompareEffect(() => {
        setSelectedPath(paths[0]);
    }, [paths]);

    // handle keyboard navigation
    // arrow down/up: navigate to the next/previous hit in the current segment
    // alt + arrow down/up: skip over 5 hits
    // meta + arrow down/up: skip to the start of the next section (or if previous, the start of the current section or previous section)
    const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
        if (event.target !== inputRef.current) {
            // don't prevent default if the target is not the search input
            return;
        }

        try {
            const index = paths.indexOf(value);
            const currentSegmentIndex = segmentsIndices.findLastIndex((segment) => index >= segment.index);
            if (event.key === "ArrowDown") {
                if (!event.altKey && !event.metaKey && !event.shiftKey && !event.ctrlKey) {
                    setSelectedPath(paths[index + 1] ?? last(paths));
                } else if (event.altKey) {
                    setSelectedPath(paths[index + 5] ?? last(paths));
                } else if (event.metaKey) {
                    const nextSegment = segmentsIndices[currentSegmentIndex + 1];
                    setSelectedPath(paths[nextSegment?.index ?? paths.length - 1]);
                } else {
                    // don't prevent default
                    return;
                }
            } else if (event.key === "ArrowUp") {
                if (!event.altKey && !event.metaKey && !event.shiftKey && !event.ctrlKey) {
                    setSelectedPath(paths[index - 1] ?? paths[0]);
                } else if (event.altKey) {
                    setSelectedPath(paths[index - 5] ?? paths[0]);
                } else if (event.metaKey) {
                    // this is a special UX case where if you're not at the start of the current segment, meta + up will jump to the start of the current segment
                    // and if you're at the start of the current segment, it will jump to the start of the previous segment
                    const currentSegmentStartIndex = segmentsIndices[currentSegmentIndex].index;
                    const previousSegment = segmentsIndices[currentSegmentIndex - 1];
                    const jumpedToIndex =
                        currentSegmentStartIndex === index ? previousSegment?.index : currentSegmentStartIndex;
                    setSelectedPath(paths[jumpedToIndex ?? 0]);
                } else {
                    // don't prevent default
                    return;
                }
            } else {
                // don't prevent default for any other keys
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
        } catch (error) {
            // ignore
        }
    });

    // add the event listener when this component mounts
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [paths, handleKeyDown]);

    return (
        <RadioGroup.Root value={value} onValueChange={setSelectedPath} name="fern-docs-search-selected-hit">
            {children}
        </RadioGroup.Root>
    );
}
