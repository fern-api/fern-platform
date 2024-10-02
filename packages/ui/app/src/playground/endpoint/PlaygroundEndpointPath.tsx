import {
    Environment,
    EnvironmentId,
    HttpMethod,
    ObjectProperty,
    PathPart,
    buildRequestUrl,
} from "@fern-api/fdr-sdk/api-definition";
import { CopyToClipboardButton, FernButton } from "@fern-ui/components";
import { unknownToString, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import * as Dialog from "@radix-ui/react-dialog";
import cn from "clsx";
import { Xmark } from "iconoir-react";
import { isUndefined, omitBy } from "lodash-es";
import { FC, Fragment, ReactNode } from "react";
import { usePlaygroundEnvironment } from "../../atoms";
import { useAllEnvironmentIds } from "../../atoms/environment";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { MaybeEnvironmentDropdown } from "../../components/MaybeEnvironmentDropdown";
import { PlaygroundSendRequestButton } from "../PlaygroundSendRequestButton";
import { PlaygroundRequestFormState } from "../types";

interface PlaygroundEndpointPathProps {
    method: HttpMethod | undefined;
    environment: Environment | undefined;
    environmentFilters: EnvironmentId[] | undefined;
    formState: PlaygroundRequestFormState;
    path: PathPart[];
    queryParameters: ObjectProperty[] | undefined;
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
    const isEditingEnvironment = useBooleanState(false);
    const playgroundEnvironment = usePlaygroundEnvironment();

    return (
        <div className="playground-endpoint">
            <div className="flex h-10 min-w-0 flex-1 shrink gap-2 rounded-lg bg-tag-default px-4 py-2 max-sm:h-8 max-sm:px-2 max-sm:py-1 sm:rounded-[20px] items-center">
                {method != null && <HttpMethodTag method={method} className="playground-endpoint-method" />}
                <span
                    className={cn(
                        environment != null && environmentIds.length > 1
                            ? "playground-endpoint-url-with-switcher"
                            : "playground-endpoint-url",
                        "flex flex-row w-full",
                        "items-baseline",
                    )}
                >
                    <span className="playground-endpoint-baseurl max-sm:hidden">
                        {environment != null && (
                            <MaybeEnvironmentDropdown
                                selectedEnvironment={environment}
                                environmentFilters={environmentFilters}
                                small
                                urlTextStyle="playground-endpoint-baseurl max-sm:hidden"
                                protocolTextStyle="playground-endpoint-baseurl max-sm:hidden"
                                editable
                                isEditingEnvironment={isEditingEnvironment}
                            />
                        )}
                    </span>
                    {path.map((part, idx) => {
                        return visitDiscriminatedUnion(part, "type")._visit({
                            literal: (literal) => <span key={idx}>{literal.value}</span>,
                            pathParameter: (pathParameter) => {
                                const stateValue = unknownToString(formState.pathParameters[pathParameter.value]);
                                return (
                                    <span
                                        key={idx}
                                        className={cn({
                                            "bg-accent-highlight t-accent px-1 rounded before:content-[':']":
                                                stateValue.length === 0,
                                            "t-accent font-semibold": stateValue.length > 0,
                                        })}
                                    >
                                        {stateValue.length > 0 ? encodeURI(stateValue) : pathParameter.value}
                                    </span>
                                );
                            },
                            _other: () => null,
                        });
                    })}
                    {queryParameters &&
                        queryParameters.length > 0 &&
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
                        buildRequestUrl({
                            path,
                            pathParameters: formState.pathParameters,
                            queryParameters: formState.queryParameters,
                            baseUrl: playgroundEnvironment ?? environment?.baseUrl,
                        })
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
