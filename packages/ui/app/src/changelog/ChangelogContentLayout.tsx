import { useAtomValue } from "jotai";
import { ReactElement, ReactNode } from "react";
import { SIDEBAR_ROOT_NODE_ATOM } from "../atoms";

interface ChangelogContentLayoutProps {
    stickyContent?: ReactNode;
    children: ReactNode;
}

export function ChangelogContentLayout({ children, stickyContent }: ChangelogContentLayoutProps): ReactElement {
    const fullWidth = useAtomValue(SIDEBAR_ROOT_NODE_ATOM) == null;
    const asideContent = stickyContent != null && <div className="fern-changelog-date">{stickyContent}</div>;
    return fullWidth ? (
        <>
            <aside>{asideContent}</aside>
            <div className="fern-changelog-content">
                {asideContent}
                {children}
            </div>
        </>
    ) : (
        <>
            <div className="fern-changelog-content">
                {asideContent}
                {children}
            </div>
            <aside>{asideContent}</aside>
        </>
    );
}
