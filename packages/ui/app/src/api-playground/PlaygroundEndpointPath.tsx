import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { isUndefined, omitBy } from "lodash-es";
import { FC, Fragment } from "react";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { ResolvedEndpointDefinition } from "../util/resolver";
import { PlaygroundRequestFormState } from "./types";
import { buildEndpointUrl, unknownToString } from "./utils";

interface PlaygroundEndpointPathProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState;
}

export const PlaygroundEndpointPath: FC<PlaygroundEndpointPathProps> = ({ endpoint, formState }) => {
    const environment = endpoint.defaultEnvironment ?? endpoint.environments[0];
    return (
        <div className="playground-endpoint">
            {endpoint != null && <HttpMethodTag method={endpoint.method} className="playground-endpoint-method" />}
            <span className="playground-endpoint-url">
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
                                        "bg-accent-highlight t-accent px-1 rounded before:content-[':']":
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
                                    <span className={"t-accent font-semibold"}>{encodeURI(stateValue)}</span>
                                </Fragment>
                            );
                        })}
            </span>
            <CopyToClipboardButton
                className="playground-endpoint-copy-button"
                content={() => buildEndpointUrl(endpoint, formState)}
            />
        </div>
    );
};
