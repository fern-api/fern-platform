import { useEffect, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

export declare namespace VirtualizedExample {
    export interface Props<T> {
        data: T[];
        itemContent: (i: number, item: T) => JSX.Element;
        scrollToRow?: number;
        height: number;
    }
}

const LINE_HEIGHT = 21.5;
const VERTICAL_PADDING = 20;

export function VirtualizedExample<T>({
    data,
    itemContent,
    scrollToRow,
    height,
}: VirtualizedExample.Props<T>): JSX.Element {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        if (scrollToRow != null) {
            virtuosoRef.current?.scrollToIndex({
                index: scrollToRow,
                align: "start",
                behavior: "smooth",
                offset: -20,
            });
        }
    }, [scrollToRow]);

    return (
        <Virtuoso
            data={data}
            itemContent={itemContent}
            fixedItemHeight={LINE_HEIGHT}
            style={{
                height: `${height}px`,
            }}
            components={{
                Header: () => <div style={{ height: `${VERTICAL_PADDING}px` }} />,
                Footer: () => <div style={{ height: `${VERTICAL_PADDING}px` }} />,
            }}
            increaseViewportBy={50}
            overscan={50}
            ref={virtuosoRef}
        />
    );
}
