import { createRef, forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { FernCodeBlock, FernCodeGroup } from "../../components/FernCodeGroup";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { JsonPropertyPath } from "./JsonPropertyPath";
import { getJsonLineNumbers } from "./getJsonLineNumbers";

export declare namespace CodeSnippetExample {
    export interface Props extends FernCodeGroup.SingleItemProps {
        // hast: Root;
        id?: string;
        code: string;
        language: string;
        hoveredPropertyPath?: JsonPropertyPath | undefined;
        json: unknown;
        jsonStartLine?: number;
        scrollAreaStyle?: React.CSSProperties;
    }
}

const CodeSnippetExampleInternal = forwardRef<HTMLDivElement, CodeSnippetExample.Props>((props, ref) => {
    const { id, code, language, hoveredPropertyPath, json, jsonStartLine, scrollAreaStyle, ...innerProps } = props;
    const viewportRef = createRef<HTMLDivElement>();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(innerProps.viewportRef, () => viewportRef.current!);

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
            const offsetTop = (lineNumber - 1) * 19.5 - viewportRef.current.clientHeight / 4;
            viewportRef.current.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
    }, [requestHighlightLines, viewportRef]);

    return (
        <FernCodeBlock
            {...innerProps}
            id={id}
            style={scrollAreaStyle}
            language={language}
            fontSize="sm"
            code={code}
            highlightLines={requestHighlightLines}
            viewportRef={viewportRef}
            ref={ref}
        />
    );
});

CodeSnippetExampleInternal.displayName = "CodeSnippetExampleInternal";

export const CodeSnippetExample = forwardRef<HTMLDivElement, CodeSnippetExample.Props>((props, ref) => {
    return (
        <FernErrorBoundary component="CodeSnippetExample">
            <CodeSnippetExampleInternal {...props} ref={ref} />
        </FernErrorBoundary>
    );
});

CodeSnippetExample.displayName = "CodeSnippetExample";
