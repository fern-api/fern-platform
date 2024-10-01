import { ReactElement, ReactNode } from "react";
import { HorizontalSplitPane, VerticalSplitPane } from "../VerticalSplitPane";

interface PlaygroundEndpointDesktopLayoutProps {
    scrollAreaHeight: number;
    form: ReactNode;
    requestCard: ReactNode;
    responseCard: ReactNode;
}

export function PlaygroundEndpointDesktopLayout({
    scrollAreaHeight,
    form,
    requestCard,
    responseCard,
}: PlaygroundEndpointDesktopLayoutProps): ReactElement {
    // const { grpcEndpoints } = useFeatureFlags();

    return (
        <HorizontalSplitPane rizeBarHeight={scrollAreaHeight} leftClassName="pl-6 pr-1 mt" rightClassName="pl-1">
            {form}

            <VerticalSplitPane
                className="sticky inset-0 pr-6"
                style={{ height: scrollAreaHeight }}
                aboveClassName="pt-6 pb-1 flex items-stretch justify-stretch"
                belowClassName="pb-6 pt-1 flex items-stretch justify-stretch"
            >
                {requestCard}
                {responseCard}
            </VerticalSplitPane>
        </HorizontalSplitPane>
    );
}
