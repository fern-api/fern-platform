import { ReactElement, ReactNode } from "react";

import { useEdgeFlags } from "../../atoms";
import { HorizontalSplitPane, VerticalSplitPane } from "../VerticalSplitPane";

interface PlaygroundEndpointDesktopLayoutProps {
  scrollAreaHeight: number;
  form: ReactNode;
  requestCard: ReactNode;
  responseCard: ReactNode;
  endpointId?: string;
}

export function PlaygroundEndpointDesktopLayout({
  scrollAreaHeight,
  form,
  requestCard,
  responseCard,
  endpointId,
}: PlaygroundEndpointDesktopLayoutProps): ReactElement<any> {
  const { grpcEndpoints } = useEdgeFlags();

  return (
    <HorizontalSplitPane
      rizeBarHeight={scrollAreaHeight}
      leftClassName="pl-6 pr-1 mt"
      rightClassName="pl-1"
    >
      {form}

      <VerticalSplitPane
        className="sticky inset-0 pr-6"
        style={{ height: scrollAreaHeight }}
        aboveClassName={
          // TODO: Remove after pinecone demo
          endpointId && grpcEndpoints?.includes(endpointId)
            ? "py-6 flex items-stretch justify-stretch"
            : "pt-6 pb-1 flex items-stretch justify-stretch"
        }
        belowClassName="pb-6 pt-1 flex items-stretch justify-stretch"
      >
        {
          // TODO: Remove after pinecone demo
          endpointId && grpcEndpoints?.includes(endpointId) ? null : requestCard
        }
        {responseCard}
      </VerticalSplitPane>
    </HorizontalSplitPane>
  );
}
