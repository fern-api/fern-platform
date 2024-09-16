import { Loadable } from "@fern-ui/loadable";
import { Dispatch, ReactElement, SetStateAction, useDeferredValue } from "react";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../../resolver/types";
import { PlaygroundAuthorizationFormCard } from "../PlaygroundAuthorizationForm";
import { PlaygroundEndpointRequestFormState } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";
import { PlaygroundEndpointContentLayout } from "./PlaygroundEndpointContentLayout";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundEndpointFormButtons } from "./PlaygroundEndpointFormButtons";
import { PlaygroundEndpointRequestCard } from "./PlaygroundEndpointRequestCard";
import { PlaygroundResponseCard } from "./PlaygroundResponseCard";

interface PlaygroundEndpointContentProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    response: Loadable<PlaygroundResponse>;
    sendRequest: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

export function PlaygroundEndpointContent({
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    response,
    sendRequest,
    types,
}: PlaygroundEndpointContentProps): ReactElement {
    const deferredFormState = useDeferredValue(formState);

    const form = (
        <div className="mx-auto w-full max-w-5xl space-y-6 pt-6 max-sm:pt-0 sm:pb-20">
            {endpoint.auth != null && <PlaygroundAuthorizationFormCard auth={endpoint.auth} disabled={false} />}

            <div className="col-span-2 space-y-8">
                <PlaygroundEndpointForm
                    endpoint={endpoint}
                    formState={formState}
                    setFormState={setFormState}
                    types={types}
                />
            </div>

            <PlaygroundEndpointFormButtons
                endpoint={endpoint}
                resetWithExample={resetWithExample}
                resetWithoutExample={resetWithoutExample}
            />
        </div>
    );

    const requestCard = <PlaygroundEndpointRequestCard endpoint={endpoint} formState={deferredFormState} />;
    const responseCard = <PlaygroundResponseCard response={response} sendRequest={sendRequest} />;

    return (
        <PlaygroundEndpointContentLayout
            sendRequest={sendRequest}
            form={form}
            requestCard={requestCard}
            responseCard={responseCard}
        />
    );
}
