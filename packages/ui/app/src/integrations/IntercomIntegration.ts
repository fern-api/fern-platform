import * as Intercom from "@intercom/messenger-js-sdk";
import { useEffect } from "react";

export interface IntercomIntegrationProps {
    appId: string;
}

export function IntercomIntegration({ appId }: IntercomIntegrationProps): null {
    useEffect(() => {
        try {
            Intercom.boot({
                app_id: appId,
            });
            return () => {
                Intercom.shutdown();
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to boot Intercom", error);
        }
        return;
    }, [appId]);
    return null;
}
