import { ResolvedEndpointDefinition } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { isUndefined, omitBy } from "lodash-es";
import { FC, Fragment } from "react";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { PlaygroundRequestFormState } from "./types";
import { buildUrl, unknownToString } from "./utils";

interface PlaygroundEndpointRenderProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState;
}

export const PlaygroundEndpointRender: FC<PlaygroundEndpointRenderProps> = ({ endpoint, formState }) => {
    const environment = endpoint.defaultEnvironment ?? endpoint.environments[0];
    return (
        <div className="group flex min-w-0 flex-1 shrink items-center gap-2">
            <div className="inline-flex items-baseline">
                {endpoint != null && <HttpMethodTag className="mr-2" method={endpoint.method} />}
                <span className="font-mono text-xs">
                    <span className="t-muted">{environment?.baseUrl}</span>
                    {endpoint?.path.map((part, idx) => {
                        return visitDiscriminatedUnion(part, "type")._visit({
                            literal: (literal) => <span key={idx}>{literal.value}</span>,
                            pathParameter: (pathParameter) => {
                                const stateValue = unknownToString(formState?.pathParameters[pathParameter.key]);
                                return (
                                    <span
                                        key={idx}
                                        className={classNames({
                                            "bg-accent-highlight dark:bg-accent-highlight-dark text-accent-primary dark:text-accent-primary-dark px-1 rounded before:content-[':']":
                                                stateValue.length === 0,
                                            "text-accent-primary dark:text-accent-primary-dark font-semibold":
                                                stateValue.length > 0,
                                        })}
                                    >
                                        {stateValue.length > 0 ? encodeURI(stateValue) : pathParameter.key}
                                    </span>
                                );
                            },
                            _other: () => null,
                        });
                    })}
                    {endpoint != null &&
                        endpoint.queryParameters.length > 0 &&
                        Object.keys(omitBy(formState?.queryParameters, isUndefined)).length > 0 &&
                        endpoint.queryParameters
                            .filter((queryParameter) => {
                                const stateValue = formState?.queryParameters[queryParameter.key];
                                if (stateValue == null && queryParameter.shape.type === "optional") {
                                    return false;
                                }
                                return true;
                            })
                            .map((queryParameter, idx) => {
                                const stateValue = unknownToString(formState?.queryParameters[queryParameter.key]);
                                return (
                                    <Fragment key={idx}>
                                        <span>{idx === 0 ? "?" : "&"}</span>

                                        <span>{queryParameter.key}</span>
                                        <span>{"="}</span>
                                        <span
                                            className={
                                                "text-accent-primary dark:text-accent-primary-dark font-semibold"
                                            }
                                        >
                                            {encodeURI(stateValue)}
                                        </span>
                                    </Fragment>
                                );
                            })}
                </span>
            </div>
            <CopyToClipboardButton
                className={"opacity-0 transition-opacity group-hover:opacity-100"}
                content={() => {
                    return buildUrl(endpoint, formState);
                }}
            />
        </div>
    );
};
