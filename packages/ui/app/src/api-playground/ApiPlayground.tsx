"use client";

import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { CurlLine } from "../api-page/examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../api-page/examples/json-example/contexts/JsonPropertyPath";
import { JsonLine } from "../api-page/examples/json-example/jsonLineUtils";

import ApiRequest from "./ApiRequest";
import ApiResponse from "./ApiResponse";

export interface Props {
    endpoint: FernRegistryApiRead.EndpointDefinition;
    req: CurlLine[];
    selectedReqProp: JsonPropertyPath | undefined;
    res: JsonLine[];
    selectedResProp: JsonPropertyPath | undefined;
    example: FernRegistryApiRead.ExampleEndpointCall;
}

export default function ApiPlayground({
    endpoint,
    req,
    selectedReqProp,
    res,
    selectedResProp,
    example,
}: Props): JSX.Element {
    // console.log("*** req", req);
    // console.log("*** res", res);
    console.log("*** endpoint", endpoint);
    return (
        <div className="grid min-h-0 flex-1 grid-rows-[repeat(auto-fit,_minmax(0,_min-content))] gap-6">
            <ApiRequest type="primary" data={req} selectedProp={selectedReqProp} endpoint={endpoint} />
            <ApiResponse type="primary" data={res} selectedProp={selectedResProp} example={example} />
        </div>
    );
}
