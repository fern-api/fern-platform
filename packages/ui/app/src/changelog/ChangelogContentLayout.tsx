import clsx from "clsx";
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

interface ChangelogContentLayoutProps extends ComponentPropsWithoutRef<"div"> {
    as: "div" | "section" | "article";
    stickyContent?: ReactNode;
    children: ReactNode;
}

export function ChangelogContentLayout({
    as: Component,
    children,
    stickyContent,
    ...props
}: ChangelogContentLayoutProps): ReactElement {
    const asideContent = stickyContent != null && <div className="fern-changelog-date">{stickyContent}</div>;
    return (
        <Component {...props} className={clsx("fern-changelog-entry", props.className)}>
            <aside>{asideContent}</aside>
            <div className="fern-changelog-content">
                {asideContent}
                {children}
            </div>
        </Component>
    );
}
