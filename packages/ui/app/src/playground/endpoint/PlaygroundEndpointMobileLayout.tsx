import { FernTabs } from "@fern-ui/components";
import { ReactElement, ReactNode, useState } from "react";

interface PlaygroundEndpointMobileLayoutProps {
    form: ReactNode;
    requestCard: ReactNode;
    responseCard: ReactNode;
    sendButton: ReactNode;
}

export function PlaygroundEndpointMobileLayout({
    form,
    requestCard,
    responseCard,
    sendButton,
}: PlaygroundEndpointMobileLayoutProps): ReactElement {
    const [tabValue, setTabValue] = useState<string>("0");
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
                            {requestCard}
                        </div>
                    ),
                },
                { title: "Response", content: responseCard },
            ]}
        />
    );
}
