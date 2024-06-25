import { FernCard } from "@fern-ui/components";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { Callout } from "../mdx/components/Callout";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel } from "../resolver/types";
import { PlaygroundAuthorizationFormCard } from "./PlaygroundAuthorizationForm";
import { PlaygroundObjectPropertiesForm } from "./form/PlaygroundObjectPropertyForm";
import { PlaygroundWebSocketRequestFormState } from "./types";

interface PlaygroundWebSocketHandshakeFormProps {
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    types: Record<string, ResolvedTypeDefinition>;
    error: string | null;
    disabled: boolean;
}

export const PlaygroundWebSocketHandshakeForm: FC<PlaygroundWebSocketHandshakeFormProps> = ({
    websocket,
    formState,
    setFormState,
    types,
    error,
    disabled,
}) => {
    const setHeaders = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                headers: typeof value === "function" ? value(state.headers) : value,
            }));
        },
        [setFormState],
    );

    const setPathParameters = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                pathParameters: typeof value === "function" ? value(state.pathParameters) : value,
            }));
        },
        [setFormState],
    );

    const setQueryParameters = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                queryParameters: typeof value === "function" ? value(state.queryParameters) : value,
            }));
        },
        [setFormState],
    );

    if (
        error == null &&
        websocket.auth == null &&
        websocket.headers.length === 0 &&
        websocket.pathParameters.length === 0 &&
        websocket.queryParameters.length === 0
    ) {
        return null;
    }

    return (
        <>
            {error != null && (
                <Callout intent="error">
                    <div className="text-base">{error}</div>
                </Callout>
            )}

            {websocket.auth != null && (
                <PlaygroundAuthorizationFormCard
                    auth={websocket.auth}
                    authState={formState?.auth}
                    setAuthorization={(newState) =>
                        setFormState((oldState) => ({
                            ...oldState,
                            auth: typeof newState === "function" ? newState(oldState.auth) : newState,
                        }))
                    }
                    disabled={disabled}
                />
            )}

            <div className="col-span-2 space-y-8">
                {websocket.headers.length > 0 && (
                    <div>
                        <div className="mb-4 px-4">
                            <h5 className="t-muted m-0">Headers</h5>
                        </div>
                        <FernCard className="rounded-lg p-4 shadow-sm">
                            <PlaygroundObjectPropertiesForm
                                id="header"
                                properties={websocket.headers}
                                onChange={setHeaders}
                                value={formState?.headers}
                                types={types}
                                disabled={disabled}
                            />
                        </FernCard>
                    </div>
                )}

                {websocket.pathParameters.length > 0 && (
                    <div>
                        <div className="mb-4 px-4">
                            <h5 className="t-muted m-0">Path Parameters</h5>
                        </div>
                        <FernCard className="rounded-lg p-4 shadow-sm">
                            <PlaygroundObjectPropertiesForm
                                id="path"
                                properties={websocket.pathParameters}
                                onChange={setPathParameters}
                                value={formState?.pathParameters}
                                types={types}
                                disabled={disabled}
                            />
                        </FernCard>
                    </div>
                )}

                {websocket.queryParameters.length > 0 && (
                    <div>
                        <div className="mb-4 px-4">
                            <h5 className="t-muted m-0">Query Parameters</h5>
                        </div>
                        <FernCard className="rounded-lg p-4 shadow-sm">
                            <PlaygroundObjectPropertiesForm
                                id="query"
                                properties={websocket.queryParameters}
                                onChange={setQueryParameters}
                                value={formState?.queryParameters}
                                types={types}
                                disabled={disabled}
                            />
                        </FernCard>
                    </div>
                )}
            </div>

            <hr />
        </>
    );
};
