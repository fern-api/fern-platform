import { ReactElement, useEffect, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

export declare namespace VirtualizedExample {
    export interface Props<T> {
        data: T[];
        itemContent: (i: number, item: T) => ReactElement;
        scrollToRow?: number;
        height: number;
    }
}

const LINE_HEIGHT = 20;
const VERTICAL_PADDING = 12;

export function VirtualizedExample<T>({
    data,
    itemContent,
    scrollToRow,
    height,
}: VirtualizedExample.Props<T>): ReactElement {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        if (scrollToRow != null && scrollToRow > -1) {
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
            defaultItemHeight={LINE_HEIGHT}
            height={height}
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
