import { FernCard } from "@fern-ui/components";
import { PropsWithChildren, ReactElement, ReactNode } from "react";

interface PlaygroundEndpointFormSection {
    title?: ReactNode;
    ignoreHeaders: boolean | undefined;
}

export function PlaygroundEndpointFormSection({
    title,
    ignoreHeaders,
    children,
}: PropsWithChildren<PlaygroundEndpointFormSection>): ReactElement | null {
    if (children == null) {
        return null;
    }
    return (
        <section>
            {!ignoreHeaders && title && (
                <div className="mb-4 px-4">
                    {typeof title === "string" ? <h5 className="t-muted m-0">{title}</h5> : title}
                </div>
            )}
            <FernCard className="rounded-xl p-4 shadow-sm">{children}</FernCard>
        </section>
    );
}
