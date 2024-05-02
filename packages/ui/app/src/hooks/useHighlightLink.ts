import { useCallback } from "react";
import { toast } from "../components/FernToast";
import { useSelection } from "./useSelection";

interface Fragment {
    textStart: string;
    textEnd: string;
    prefix: string;
    suffix: string;
}

export const useHighlightLink: () => () => Promise<void> = () => {
    const { selection } = useSelection();

    const generateFragment = useCallback((selection: Selection): { status: number; fragment: Fragment } => {
        const range = selection.getRangeAt(0);
        const fragment: Fragment = {
            textStart: "",
            textEnd: "",
            prefix: "",
            suffix: "",
        };

        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(range.startContainer);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        fragment.prefix = preCaretRange.toString();

        const postCaretRange = range.cloneRange();
        postCaretRange.selectNodeContents(range.endContainer);
        postCaretRange.setStart(range.endContainer, range.endOffset);
        fragment.suffix = postCaretRange.toString();

        fragment.prefix = fragment.prefix.replace(/-/g, "%2D").replace(/,/g, "%2C");
        fragment.suffix = fragment.suffix.replace(/-/g, "%2D").replace(/,/g, "%2C");

        fragment.textStart = range.toString();

        return { status: 0, fragment };
    }, []);

    const createAndCopyHighlightLink = useCallback(async () => {
        if (selection && selection.toString().trim()) {
            const result = generateFragment(selection);
            let url = `${location.origin}${location.pathname}${location.search}`;
            if (result.status === 0) {
                const { prefix, textStart, textEnd, suffix } = result.fragment;
                const encodedPrefix = prefix ? `${encodeURIComponent(prefix)}-,` : "";
                const encodedSuffix = suffix ? `,-${encodeURIComponent(suffix)}` : "";
                const encodedTextStart = encodeURIComponent(textStart);
                const encodedTextEnd = textEnd ? `,${encodeURIComponent(textEnd)}` : "";

                url = `${url}#:~:text=${encodedPrefix}${encodedTextStart}${encodedTextEnd}${encodedSuffix}`;
                await navigator.clipboard.writeText(url);
                toast.success("Copied link to highlighted text!");
            } else {
                toast.error("Could not create URL");
            }
        }
    }, [generateFragment, selection]);

    return createAndCopyHighlightLink;
};
