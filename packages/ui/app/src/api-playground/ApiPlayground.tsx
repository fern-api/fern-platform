import { CurlLine } from "../api-page/examples/curl-example/curlUtils";
import { JsonLine } from "../api-page/examples/json-example/jsonLineUtils";
import ApiRequest from "./ApiRequest";
import ApiResponse from "./ApiResponse";

interface Props {
    className?: string;
    req: CurlLine[];
    res: JsonLine[];
    example: FernRegistryApiRead.ExampleEndpointCall;
}

export default function ApiPlayground({ className, req, res, example }: Props): JSX.Element {
    return (
        <div>
            <ApiRequest />
            <ApiResponse />
        </div>
    );
}
