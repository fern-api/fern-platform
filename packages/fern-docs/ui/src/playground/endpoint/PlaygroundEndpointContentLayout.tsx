import { useResizeObserver } from "@fern-ui/react-commons";
import { useAtomValue } from "jotai";
import { ReactElement, ReactNode, useRef, useState } from "react";
import { IS_MOBILE_SCREEN_ATOM } from "../../atoms";
import { ExplorerSendRequestButton } from "../ExplorerSendRequestButton";
import { ExplorerEndpointDesktopLayout } from "./ExplorerEndpointDesktopLayout";
import { ExplorerEndpointMobileLayout } from "./ExplorerEndpointMobileLayout";

interface ExplorerEndpointContentLayoutProps {
  sendRequest: () => void;
  form: ReactNode;
  requestCard: ReactNode;
  responseCard: ReactNode;
  endpointId?: string;
}

export function ExplorerEndpointContentLayout({
  sendRequest,
  form,
  requestCard,
  responseCard,
  endpointId,
}: ExplorerEndpointContentLayoutProps): ReactElement {
  const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);

  useResizeObserver(scrollAreaRef, ([size]) => {
    if (size != null) {
      setScrollAreaHeight(size.contentRect.height);
    }
  });

  return (
    <div className="flex min-h-0 w-full flex-1 shrink items-stretch divide-x">
      <div
        ref={scrollAreaRef}
        className="mask-grad-top-6 w-full overflow-x-hidden overflow-y-scroll overscroll-contain"
      >
        {!isMobileScreen ? (
          <ExplorerEndpointDesktopLayout
            scrollAreaHeight={scrollAreaHeight}
            form={form}
            requestCard={requestCard}
            responseCard={responseCard}
            endpointId={endpointId}
          />
        ) : (
          <ExplorerEndpointMobileLayout
            form={form}
            requestCard={requestCard}
            responseCard={responseCard}
            sendButton={
              <ExplorerSendRequestButton sendRequest={sendRequest} />
            }
            endpointId={endpointId}
          />
        )}
      </div>
    </div>
  );
}
