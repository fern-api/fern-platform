import { APIV1Read } from "@fern-api/fdr-sdk";
import { Loadable, notStartedLoading } from "@fern-ui/loadable";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import { FernTooltipProvider } from "../components/FernTooltip";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel } from "../util/resolver";
import { ApiPlaygroundWebSocketContent } from "./ApiPlaygroundWebSocketContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { PlaygroundWebSocketRequestFormState, ResponsePayload } from "./types";

interface ApiPlaygroundWebSocketProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

export const ApiPlaygroundWebSocket: FC<ApiPlaygroundWebSocketProps> = ({
    auth,
    websocket,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    types,
}): ReactElement => {
    const [response, _setResponse] = useState<Loadable<ResponsePayload>>(notStartedLoading());

    const sendRequest = useCallback(() => {
        // do nothing
    }, []);

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={undefined}
                        formState={formState}
                        sendRequest={sendRequest}
                        environment={websocket.defaultEnvironment ?? websocket.environments[0]}
                        path={websocket.path}
                        queryParameters={websocket.queryParameters}
                        sendRequestButtonLabel={"Connect"}
                        sendRequestIcon={"plug"}
                    />
                </div>
                <div className="flex min-h-0 flex-1 shrink">
                    <ApiPlaygroundWebSocketContent
                        auth={auth}
                        websocket={websocket}
                        formState={formState}
                        setFormState={setFormState}
                        resetWithExample={resetWithExample}
                        resetWithoutExample={resetWithoutExample}
                        response={response}
                        sendRequest={sendRequest}
                        types={types}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
