import { Loadable } from "@fern-ui/loadable";
import { Dispatch, ReactElement, SetStateAction, useDeferredValue } from "react";
import { PlaygroundAuthorizationFormCard } from "../PlaygroundAuthorizationForm";
import { PlaygroundEndpointRequestFormState } from "../types";
import { EndpointContext } from "../types/endpoint-context";
import { PlaygroundResponse } from "../types/playgroundResponse";
import { PlaygroundEndpointContentLayout } from "./PlaygroundEndpointContentLayout";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundEndpointFormButtons } from "./PlaygroundEndpointFormButtons";
import { PlaygroundEndpointRequestCard } from "./PlaygroundEndpointRequestCard";
import { PlaygroundResponseCard } from "./PlaygroundResponseCard";

interface PlaygroundEndpointContentProps {
    context: EndpointContext;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    response: Loadable<PlaygroundResponse>;
    sendRequest: () => void;
}

export function PlaygroundEndpointContent({
    context,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    response,
    sendRequest,
}: PlaygroundEndpointContentProps): ReactElement {
    const deferredFormState = useDeferredValue(formState);

    const form = (
        <div className="mx-auto w-full max-w-5xl space-y-6 pt-6 max-sm:pt-0 sm:pb-20">
            {context.auth != null && <PlaygroundAuthorizationFormCard auth={context.auth} disabled={false} />}

            <div className="col-span-2 space-y-8">
                <PlaygroundEndpointForm context={context} formState={formState} setFormState={setFormState} />
            </div>

            <PlaygroundEndpointFormButtons
                node={context.node}
                resetWithExample={resetWithExample}
                resetWithoutExample={resetWithoutExample}
            />
        </div>
    );

    const requestCard = <PlaygroundEndpointRequestCard context={context} formState={deferredFormState} />;
    const responseCard = <PlaygroundResponseCard response={response} sendRequest={sendRequest} />;

    return (
        <PlaygroundEndpointContentLayout
            endpointId={context.endpoint.id}
            sendRequest={sendRequest}
            form={form}
            requestCard={requestCard}
            responseCard={responseCard}
        />
    );
}
