import { ReactElement, ReactNode } from "react";
import { useFeatureFlags } from "../../atoms";
import { HorizontalSplitPane, VerticalSplitPane } from "../VerticalSplitPane";

interface PlaygroundEndpointDesktopLayoutProps {
    endpointId: string;
    scrollAreaHeight: number;
    form: ReactNode;
    requestCard: ReactNode;
    responseCard: ReactNode;
}

export function PlaygroundEndpointDesktopLayout({
    endpointId,
    scrollAreaHeight,
    form,
    requestCard,
    responseCard,
}: PlaygroundEndpointDesktopLayoutProps): ReactElement {
    const { grpcEndpoints } = useFeatureFlags();

    return (
        <HorizontalSplitPane rizeBarHeight={scrollAreaHeight} leftClassName="pl-6 pr-1 mt" rightClassName="pl-1">
            {form}

            <VerticalSplitPane
                className="sticky inset-0 pr-6"
                style={{ height: scrollAreaHeight }}
                aboveClassName={
                    // TODO: Remove after pinecone demo
                    grpcEndpoints?.includes(endpointId)
                        ? "py-6 flex items-stretch justify-stretch"
                        : "pt-6 pb-1 flex items-stretch justify-stretch"
                }
                belowClassName="pb-6 pt-1 flex items-stretch justify-stretch"
            >
                {
                    // TODO: Remove after pinecone demo
                    grpcEndpoints?.includes(endpointId) ? null : requestCard
                }
                {responseCard}
            </VerticalSplitPane>
        </HorizontalSplitPane>
    );
}
