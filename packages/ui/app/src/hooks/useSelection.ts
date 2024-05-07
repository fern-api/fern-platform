import { useEffect, useState } from "react";

export const useSelection: () => {
    selection: Selection | null;
} = () => {
    const [selection, setSelection] = useState<Selection | null>(null);

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            setSelection(selection);
        };

        document.addEventListener("selectionchange", handleSelectionChange);

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, []);

    return { selection };
};
