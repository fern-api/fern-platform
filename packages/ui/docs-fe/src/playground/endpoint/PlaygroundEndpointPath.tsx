import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-platform/core-utils";
import { CopyToClipboardButton, FernButton } from "@fern-ui/components";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { Xmark } from "iconoir-react";
import { isUndefined, omitBy } from "lodash-es";
import { FC, Fragment, ReactNode } from "react";
import { useAllEnvironmentIds } from "../../atoms/environment";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { MaybeEnvironmentDropdown } from "../../components/MaybeEnvironmentDropdown";
import { ResolvedEndpointPathParts, ResolvedObjectProperty } from "../../resolver/types";
import { PlaygroundSendRequestButton } from "../PlaygroundSendRequestButton";
import { PlaygroundRequestFormState } from "../types";
import { buildRequestUrl, unknownToString } from "../utils";

interface PlaygroundEndpointPathProps {
    method: APIV1Read.HttpMethod | undefined;
    environment: APIV1Read.Environment | undefined;
    environmentFilters: APIV1Read.EnvironmentId[] | undefined;
    formState: PlaygroundRequestFormState;
    path: ResolvedEndpointPathParts[];
    queryParameters: ResolvedObjectProperty[];
    sendRequest: () => void;
    sendRequestButtonLabel?: string;
    sendRequestIcon?: ReactNode;
}

export const PlaygroundEndpointPath: FC<PlaygroundEndpointPathProps> = ({
    environment,
    environmentFilters,
    method,
    formState,
    path,
    queryParameters,
    sendRequest,
    sendRequestButtonLabel,
    sendRequestIcon,
}) => {
    const environmentIds = useAllEnvironmentIds();

    return (
        <div className="playground-endpoint">
            <div className="bg-tag-default flex h-10 min-w-0 flex-1 shrink items-center gap-2 rounded-lg px-4 py-2 max-sm:h-8 max-sm:px-2 max-sm:py-1 sm:rounded-[20px]">
                {method != null && <HttpMethodTag method={method} className="playground-endpoint-method" />}
                <span
                    className={
                        environment != null && environmentIds.length > 1
                            ? "playground-endpoint-url-with-switcher"
                            : "playground-endpoint-url"
                    }
                >
                    <span className="playground-endpoint-baseurl max-sm:hidden">
                        {environment != null && (
                            <MaybeEnvironmentDropdown
                                selectedEnvironment={environment}
                                environmentFilters={environmentFilters}
                                small
                                urlTextStyle="playground-endpoint-baseurl max-sm:hidden"
                                protocolTextStyle="playground-endpoint-baseurl max-sm:hidden"
                            />
                        )}
                    </span>
                    {path.map((part, idx) => {
                        return visitDiscriminatedUnion(part, "type")._visit({
                            literal: (literal) => <span key={idx}>{literal.value}</span>,
                            pathParameter: (pathParameter) => {
                                const stateValue = unknownToString(formState.pathParameters[pathParameter.key]);
                                return (
                                    <span
                                        key={idx}
                                        className={clsx({
                                            "bg-accent-highlight t-accent rounded px-1 before:content-[':']":
                                                stateValue.length === 0,
                                            "t-accent font-semibold": stateValue.length > 0,
                                        })}
                                    >
                                        {stateValue.length > 0 ? encodeURI(stateValue) : pathParameter.key}
                                    </span>
                                );
                            },
                            _other: () => null,
                        });
                    })}
                    {queryParameters.length > 0 &&
                        Object.keys(omitBy(formState.queryParameters, isUndefined)).length > 0 &&
                        queryParameters
                            .filter((queryParameter) => {
                                const stateValue = formState.queryParameters[queryParameter.key];
                                if (stateValue == null && queryParameter.valueShape.type === "optional") {
                                    return false;
                                }
                                return true;
                            })
                            .map((queryParameter, idx) => {
                                const stateValue = unknownToString(formState.queryParameters[queryParameter.key]);
                                return (
                                    <Fragment key={idx}>
                                        <span>{idx === 0 ? "?" : "&"}</span>

                                        <span>{queryParameter.key}</span>
                                        <span>{"="}</span>
                                        <span className={"t-accent font-semibold"}>{encodeURI(stateValue)}</span>
                                    </Fragment>
                                );
                            })}
                </span>
                <CopyToClipboardButton
                    className="playground-endpoint-copy-button"
                    content={() =>
                        buildRequestUrl(environment?.baseUrl, path, formState.pathParameters, formState.queryParameters)
                    }
                />
            </div>

            <div className="max-sm:hidden">
                <PlaygroundSendRequestButton
                    sendRequest={sendRequest}
                    sendRequestButtonLabel={sendRequestButtonLabel}
                    sendRequestIcon={sendRequestIcon}
                />
            </div>

            <Dialog.Close asChild className="max-sm:hidden">
                <FernButton icon={<Xmark />} size="large" rounded variant="outlined" />
            </Dialog.Close>
        </div>
    );
};
