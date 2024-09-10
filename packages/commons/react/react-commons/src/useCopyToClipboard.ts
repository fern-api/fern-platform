import { useEffect, useMemo, useRef, useState } from "react";
import { useTimeout } from "./useTimeout";

export declare namespace useCopyToClipboard {
    export interface Return {
        copyToClipboard: (() => void) | undefined;
        wasJustCopied: boolean;
    }
}

export function useCopyToClipboard(
    content: string | (() => string | Promise<string>) | undefined,
): useCopyToClipboard.Return {
    const contentRef = useRef(content);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    const [wasJustCopied, setWasJustCopied] = useState(false);

    const copyToClipboard = useMemo(() => {
        const currentContent = contentRef.current;
        if (currentContent == null) {
            return undefined;
        }
        return async () => {
            setWasJustCopied(true);
            await navigator.clipboard.writeText(
                typeof currentContent === "function" ? await currentContent() : currentContent,
            );
        };
    }, []);

    useTimeout(
        () => {
            setWasJustCopied(false);
        },
        wasJustCopied ? 2_000 : undefined,
    );

    return {
        copyToClipboard,
        wasJustCopied,
    };
}
