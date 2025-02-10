import { ReactElement, ReactNode, useState } from "react";

import { FernTabs } from "@fern-docs/components";

import { useEdgeFlags } from "../../atoms";

interface PlaygroundEndpointMobileLayoutProps {
  form: ReactNode;
  requestCard: ReactNode;
  responseCard: ReactNode;
  sendButton: ReactNode;
  endpointId?: string;
}

export function PlaygroundEndpointMobileLayout({
  endpointId,
  form,
  requestCard,
  responseCard,
  sendButton,
}: PlaygroundEndpointMobileLayoutProps): ReactElement<any> {
  const [tabValue, setTabValue] = useState<string>("0");
  const { grpcEndpoints } = useEdgeFlags();
  return (
    <FernTabs
      className="px-4"
      defaultValue="0"
      value={tabValue}
      onValueChange={setTabValue}
      tabs={[
        {
          title: "Request",
          content: (
            <div className="space-y-4 pb-6">
              {form}
              <div className="border-default flex justify-end border-b pb-4">
                {sendButton}
                {/* <PlaygroundSendRequestButton
                                    sendRequest={() => {
                                        sendRequest();
                                        setTabValue("1");
                                    }}
                                    sendRequestIcon={
                                        <SendSolid className="transition-transform group-hover:translate-x-0.5" />
                                    }
                                /> */}
              </div>
              {endpointId && grpcEndpoints?.includes(endpointId) && requestCard}
            </div>
          ),
        },
        { title: "Response", content: responseCard },
      ]}
    />
  );
}
