import { SnippetHttpRequest, SnippetHttpRequestBodyFormValue, convertToCurl } from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { isEmpty } from "lodash-es";
import { convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest } from "../../types";
import { PlaygroundCodeSnippetBuilder } from "./types";

export class CurlSnippetBuilder extends PlaygroundCodeSnippetBuilder {
    private isFileForgeHackEnabled: boolean = false;

    public setFileForgeHackEnabled(isFileForgeHackEnabled: boolean): CurlSnippetBuilder {
        this.isFileForgeHackEnabled = isFileForgeHackEnabled;
        return this;
    }

    public override async build(): Promise<string> {
        return await convertToCurl(
            {
                method: this.context.endpoint.method,
                url: this.url,
                queryParameters: this.formState.queryParameters,
                queryParametersEncoding: Object.fromEntries(
                    (this.context.endpoint.queryParameters ?? []).map((parameter) => {
                        return [parameter.key, parameter.arrayEncoding ?? "exploded"];
                    }),
                ),
                headers: this.formState.headers,
                basicAuth: this.context.auth?.type === "basicAuth" ? this.authState.basicAuth : undefined,
                body: this.#convertFormStateToBody(),
            },
            { usesApplicationJsonInFormDataValue: this.isFileForgeHackEnabled },
        );
    }

    #convertFormStateToBody(): SnippetHttpRequest["body"] {
        if (this.formState.body == null) {
            return undefined;
        }
        return visitDiscriminatedUnion(this.formState.body, "type")._visit<SnippetHttpRequest["body"]>({
            json: ({ value }) => ({ type: "json", value }),
            "form-data": ({ value }) => {
                const newValue: Record<string, SnippetHttpRequestBodyFormValue> = {};
                for (const [key, v] of Object.entries(value)) {
                    const convertedV = convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest(v);
                    if (convertedV != null) {
                        newValue[key] = convertedV;
                    }
                }
                if (isEmpty(newValue)) {
                    return undefined;
                }
                return { type: "form", value: newValue };
            },
            "octet-stream": ({ value }) => (value != null ? { type: "bytes", filename: value.name } : undefined),
            _other: () => undefined,
        });
    }
}
