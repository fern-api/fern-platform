import { noop } from "lodash-es";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useInView } from "react-intersection-observer";

interface TableOfContentsContextValue {
    setAnchorInView: (anchor: string | undefined) => void;
    anchorInView: string | undefined;
}
export const TableOfContentsContext = createContext<TableOfContentsContextValue>({
    setAnchorInView: noop,
    anchorInView: undefined,
});

export function useAnchorInView(anchor: string | undefined): (node?: Element | null | undefined) => void {
    const { setAnchorInView } = useContext(TableOfContentsContext);
    const { ref } = useInView({
        rootMargin: "0px 0px -50% 0px",
        threshold: 0.5,
        onChange: (inView) => {
            if (inView) {
                setAnchorInView(anchor);
            }
        },
    });
    return ref;
}

export const TableOfContentsContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [anchorInView, setAnchorInView] = useState<string | undefined>(undefined);
    return (
        <TableOfContentsContext.Provider value={{ setAnchorInView, anchorInView }}>
            {children}
        </TableOfContentsContext.Provider>
    );
};
