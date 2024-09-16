import { useAtomValue } from "jotai";
import { ReactElement, ReactNode } from "react";
import { SIDEBAR_ROOT_NODE_ATOM } from "../atoms";

interface ChangelogContentLayoutProps {
    stickyContent?: ReactNode;
    children: ReactNode;
}

export function ChangelogContentLayout({ children, stickyContent }: ChangelogContentLayoutProps): ReactElement {
    const fullWidth = useAtomValue(SIDEBAR_ROOT_NODE_ATOM) == null;
    return fullWidth ? (
        <>
            <div className="hidden w-64 flex-initial shrink-0 lg:block">
                {stickyContent != null && (
                    <div className="top-header-offset-padded t-muted sticky mb-8 text-base">{stickyContent}</div>
                )}
            </div>
            <div className="max-w-content-width relative mx-auto min-w-0 flex-auto shrink">
                {stickyContent != null && <div className="t-muted mb-8 text-base lg:hidden">{stickyContent}</div>}
                {children}
            </div>
        </>
    ) : (
        <>
            <div className="max-w-content-width relative mr-6 min-w-0 flex-auto shrink">
                {stickyContent != null && <div className="t-muted mb-8 text-base xl:hidden">{stickyContent}</div>}
                {children}
            </div>
            {stickyContent != null && (
                <div className="-mt-2 hidden w-72 pl-4 text-right xl:block">
                    <span className="t-muted top-header-offset-padded sticky text-base">{stickyContent}</span>
                </div>
            )}
        </>
    );
}
