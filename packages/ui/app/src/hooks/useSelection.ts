import { useEffect, useState } from "react";

export const useSelection: () => { selection: Selection | null; textSelection: string | undefined } = () => {
    const [selection, setSelection] = useState<Selection | null>(null);
    const [textSelection, setTextSelection] = useState<string | undefined>();

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            setSelection(selection);
        };

        document.addEventListener("selectionchange", handleSelectionChange);

        setTextSelection(selection?.toString().trim());

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, [selection]);

    return { selection, textSelection };
};
