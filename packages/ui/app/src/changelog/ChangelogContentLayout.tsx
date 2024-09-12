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
            <div className="hidden lg:block flex-initial w-64 shrink-0">
                {stickyContent != null && (
                    <div className="sticky top-header-offset-padded t-muted text-base mb-8">{stickyContent}</div>
                )}
            </div>
            <div className="mx-auto relative max-w-content-width min-w-0 shrink flex-auto">
                {stickyContent != null && <div className="t-muted text-base mb-8 lg:hidden">{stickyContent}</div>}
                {children}
            </div>
        </>
    ) : (
        <>
            <div className="relative mr-6 max-w-content-width min-w-0 shrink flex-auto">
                {stickyContent != null && <div className="t-muted text-base mb-8 xl:hidden">{stickyContent}</div>}
                {children}
            </div>
            {stickyContent != null && (
                <div className="-mt-2 w-72 pl-4 text-right hidden xl:block">
                    <span className="t-muted text-base sticky top-header-offset-padded">{stickyContent}</span>
                </div>
            )}
        </>
    );
}
