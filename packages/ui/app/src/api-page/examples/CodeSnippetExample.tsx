import { isPlainObject } from "@fern-ui/core-utils";
import type { Root } from "hast";
import jp from "jsonpath";
import { createRef, FC, useEffect, useMemo } from "react";
import { FernSyntaxHighlighterHast } from "../../commons/FernSyntaxHighlighter";
import { JsonPropertyPath, JsonPropertyPathPart } from "./JsonPropertyPath";
import { TitledExample } from "./TitledExample";

export declare namespace CodeSnippetExample {
    export interface Props extends TitledExample.Props {
        hast: Root;
        language: string;
        hoveredPropertyPath: JsonPropertyPath | undefined;
        json: unknown;
        jsonStartLine?: number;
        scrollAreaStyle?: React.CSSProperties;
        measureHeight?: (height: number) => void;
    }
}

export const CodeSnippetExample: FC<CodeSnippetExample.Props> = ({
    hast,
    language,
    hoveredPropertyPath,
    json,
    jsonStartLine,
    scrollAreaStyle,
    measureHeight,
    ...props
}) => {
    const codeBlockRef = createRef<HTMLPreElement>();
    const viewportRef = createRef<HTMLDivElement>();

    useEffect(() => {
        if (measureHeight == null || codeBlockRef.current == null) {
            return;
        }

        const resizeObserver = new ResizeObserver(([entry]) => {
            if (entry != null) {
                measureHeight(entry.contentRect.height);
            }
        });

        resizeObserver.observe(codeBlockRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, [codeBlockRef, measureHeight]);

    const requestHighlightLines = useMemo(() => {
        if (hoveredPropertyPath == null || hoveredPropertyPath.length === 0 || jsonStartLine === -1) {
            return [];
        }
        const startLine = jsonStartLine ?? 0;
        return getJsonLineNumbers(json, hoveredPropertyPath, startLine + 1);
    }, [hoveredPropertyPath, jsonStartLine, json]);

    useEffect(() => {
        if (viewportRef.current != null && requestHighlightLines[0] != null) {
            const lineNumber = Array.isArray(requestHighlightLines[0])
                ? requestHighlightLines[0][0]
                : requestHighlightLines[0];
            const offsetTop = (lineNumber - 2) * 20;
            viewportRef.current.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
    }, [requestHighlightLines, viewportRef]);

    return (
        <TitledExample {...props}>
            <FernSyntaxHighlighterHast
                className="rounded-b-[inherit]"
                ref={codeBlockRef}
                style={scrollAreaStyle}
                viewportRef={viewportRef}
                hast={hast}
                language={language}
                fontSize="sm"
                highlightLines={requestHighlightLines}
            />
        </TitledExample>
    );
};

export function getJsonLineNumbers(json: unknown, path: JsonPropertyPath, start = 0): (number | [number, number])[] {
    const jsonString = JSON.stringify(json, undefined, 2);
    const part = path[0];
    if (part == null) {
        const length = jsonString.split("\n").length;
        return length === 0 ? [] : length === 1 ? [start] : [[start, start + length - 1]];
    }

    const query = "$" + getQueryPart(part);

    const results = jp.query(json, query);

    if (part.type === "objectFilter") {
        if (isPlainObject(json) && json[part.propertyName] === part.requiredValue) {
            return getJsonLineNumbers(json, path.slice(1), start);
        }
    }

    return results.flatMap((result) => {
        // get start of string by matching
        const toMatch = jsonStringifyAndIndent(
            result,
            part.type === "objectProperty" ? part.propertyName : undefined,
            1,
        );
        const startLine = lineNumberOf(jsonString, toMatch);
        if (startLine === -1) {
            return [];
        }

        return getJsonLineNumbers(result, path.slice(1), startLine).map((line) =>
            typeof line === "number" ? start + line : [start + line[0], start + line[1]],
        );
    });
}

export function lineNumberOf(a: string, match: string): number {
    const startChar = a.indexOf(match);
    if (startChar === -1) {
        return -1;
    }

    return a.slice(0, startChar).split("\n").length - 1;
}

function jsonStringifyAndIndent(json: unknown, key: string | undefined, depth: number) {
    let jsonString = JSON.stringify(json, undefined, 2);
    if (key != null) {
        jsonString = `"${key}": ${jsonString}`;
    }
    return jsonString
        .split("\n")
        .map((line, idx) => (idx === 0 ? line : "  ".repeat(depth) + line))
        .join("\n");
}

function getQueryPart(path: JsonPropertyPathPart) {
    switch (path.type) {
        case "objectProperty":
            return "." + (path.propertyName ?? "*");
        case "listItem":
            return "[*]";
        case "objectFilter":
            return `[?(@.${path.propertyName}=='${path.requiredValue}')]`;
    }
}
