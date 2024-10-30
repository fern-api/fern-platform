import { useDeepCompareEffect, useEventCallback } from "@fern-ui/react-commons";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { last } from "es-toolkit/array";
import { ReactElement, ReactNode, RefObject, useEffect, useState } from "react";

export function SegmentedHitsRadioGroup({
    orderedObjectIDs,
    segmentsIndices,
    children,
    inputRef,
}: {
    orderedObjectIDs: string[];
    segmentsIndices: { segment: string; index: number }[];
    children: ReactNode;
    inputRef: RefObject<HTMLInputElement>;
}): ReactElement {
    const [selectedObjectID, setSelectedObjectID] = useState((): string | undefined => orderedObjectIDs[0]);

    // fall back to the first objectID if the selectedObjectID is not in the orderedObjectIDs
    const value =
        selectedObjectID != null && orderedObjectIDs.includes(selectedObjectID)
            ? selectedObjectID
            : orderedObjectIDs[0];

    // reset the selectedObjectID to the first objectID when the orderedObjectIDs change
    useDeepCompareEffect(() => {
        setSelectedObjectID(orderedObjectIDs[0]);
    }, [orderedObjectIDs]);

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
            const index = orderedObjectIDs.indexOf(value);
            const currentSegmentIndex = segmentsIndices.findLastIndex((segment) => index >= segment.index);
            if (event.key === "ArrowDown") {
                if (!event.altKey && !event.metaKey && !event.shiftKey && !event.ctrlKey) {
                    setSelectedObjectID(orderedObjectIDs[index + 1] ?? last(orderedObjectIDs));
                } else if (event.altKey) {
                    setSelectedObjectID(orderedObjectIDs[index + 5] ?? last(orderedObjectIDs));
                } else if (event.metaKey) {
                    const nextSegment = segmentsIndices[currentSegmentIndex + 1];
                    setSelectedObjectID(orderedObjectIDs[nextSegment?.index ?? orderedObjectIDs.length - 1]);
                } else {
                    // don't prevent default
                    return;
                }
            } else if (event.key === "ArrowUp") {
                if (!event.altKey && !event.metaKey && !event.shiftKey && !event.ctrlKey) {
                    setSelectedObjectID(orderedObjectIDs[index - 1] ?? orderedObjectIDs[0]);
                } else if (event.altKey) {
                    setSelectedObjectID(orderedObjectIDs[index - 5] ?? orderedObjectIDs[0]);
                } else if (event.metaKey) {
                    // this is a special UX case where if you're not at the start of the current segment, meta + up will jump to the start of the current segment
                    // and if you're at the start of the current segment, it will jump to the start of the previous segment
                    const currentSegmentStartIndex = segmentsIndices[currentSegmentIndex].index;
                    const previousSegment = segmentsIndices[currentSegmentIndex - 1];
                    const jumpedToIndex =
                        currentSegmentStartIndex === index ? previousSegment?.index : currentSegmentStartIndex;
                    setSelectedObjectID(orderedObjectIDs[jumpedToIndex ?? 0]);
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
    }, [orderedObjectIDs]);

    return (
        <RadioGroup.Root value={value} onValueChange={setSelectedObjectID} name="fern-docs-search-selected-hit">
            {children}
        </RadioGroup.Root>
    );
}
