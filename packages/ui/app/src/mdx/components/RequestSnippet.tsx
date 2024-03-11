import { APIV1Read } from "@fern-api/fdr-sdk";
import { EndpointUrlWithOverflow } from "../../api-page/endpoints/EndpointUrlWithOverflow";
import { CodeSnippetExample } from "../../api-page/examples/CodeSnippetExample";

export declare namespace RequestSnippet {
    export interface Props {
        path: string;
        method: APIV1Read.HttpMethod;
        baseURL: string | undefined;
        // requestCodeSnippet: string;
        // requestCode: string;
        // requestCurlJson: unknown;
    }
}

export const RequestSnippet: React.FC<React.PropsWithChildren<RequestSnippet.Props>> = ({
    path,
    method,
    baseURL,
    // requestCodeSnippet,
    // requestCode,
    // requestCurlJson,
}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedPath = JSON.parse(path) as any;
    return (
        <CodeSnippetExample
            title={<EndpointUrlWithOverflow path={parsedPath} method={method} environment={baseURL} />}
            type="primary"
            onClick={(e) => {
                e.stopPropagation();
            }}
            copyToClipboardText={undefined}
            actions={undefined}
            code={""}
            language={"bash"}
            hoveredPropertyPath={undefined}
            json={{}}
            jsonStartLine={undefined}
            scrollAreaStyle={undefined}
        />
    );
};
