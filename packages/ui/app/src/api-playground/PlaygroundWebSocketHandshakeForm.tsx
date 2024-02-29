import { APIV1Read } from "@fern-api/fdr-sdk";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { FernCard } from "../components/FernCard";
import { ResolvedTypeDefinition, ResolvedWebSocketChannel } from "../util/resolver";
import { PlaygroundAuthorizationFormCard } from "./PlaygroundAuthorizationForm";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundWebSocketRequestFormState } from "./types";

interface PlaygroundWebSocketHandshakeFormProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    websocket: ResolvedWebSocketChannel;
    formState: PlaygroundWebSocketRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundWebSocketHandshakeForm: FC<PlaygroundWebSocketHandshakeFormProps> = ({
    auth,
    websocket,
    formState,
    setFormState,
    types,
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

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 pt-6">
            {websocket.authed && auth != null && (
                <PlaygroundAuthorizationFormCard
                    auth={auth}
                    authState={formState?.auth}
                    setAuthorization={(newState) =>
                        setFormState((oldState) => ({
                            ...oldState,
                            auth: typeof newState === "function" ? newState(oldState.auth) : newState,
                        }))
                    }
                />
            )}

            <div className="col-span-2 space-y-8 pb-20">
                {websocket.headers.length > 0 && (
                    <div>
                        <div className="mb-4 px-4">
                            <h5 className="t-muted m-0">Headers</h5>
                        </div>
                        <FernCard className="rounded-xl p-4 shadow-sm">
                            <PlaygroundObjectPropertiesForm
                                id="header"
                                properties={websocket.headers}
                                onChange={setHeaders}
                                value={formState?.headers}
                                types={types}
                            />
                        </FernCard>
                    </div>
                )}

                {websocket.pathParameters.length > 0 && (
                    <div>
                        <div className="mb-4 px-4">
                            <h5 className="t-muted m-0">Path Parameters</h5>
                        </div>
                        <FernCard className="rounded-xl p-4 shadow-sm">
                            <PlaygroundObjectPropertiesForm
                                id="path"
                                properties={websocket.pathParameters}
                                onChange={setPathParameters}
                                value={formState?.pathParameters}
                                types={types}
                            />
                        </FernCard>
                    </div>
                )}

                {websocket.queryParameters.length > 0 && (
                    <div>
                        <div className="mb-4 px-4">
                            <h5 className="t-muted m-0">Query Parameters</h5>
                        </div>
                        <FernCard className="rounded-xl p-4 shadow-sm">
                            <PlaygroundObjectPropertiesForm
                                id="query"
                                properties={websocket.queryParameters}
                                onChange={setQueryParameters}
                                value={formState?.queryParameters}
                                types={types}
                            />
                        </FernCard>
                    </div>
                )}
            </div>
        </div>
    );
};
