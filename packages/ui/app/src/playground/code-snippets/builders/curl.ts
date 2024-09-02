import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty } from "lodash-es";
import { stringifyHttpRequestExampleToCurl } from "../../../api-reference/examples/stringifyHttpRequestExampleToCurl";
import { ResolvedExampleEndpointRequest, ResolvedFormValue } from "../../../resolver/types";
import { convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest } from "../../types";
import { PlaygroundCodeSnippetBuilder } from "./types";

export class CurlSnippetBuilder extends PlaygroundCodeSnippetBuilder {
    private isFileForgeHackEnabled: boolean = false;

    public setFileForgeHackEnabled(isFileForgeHackEnabled: boolean): CurlSnippetBuilder {
        this.isFileForgeHackEnabled = isFileForgeHackEnabled;
        return this;
    }

    public override build(): string {
        return stringifyHttpRequestExampleToCurl({
            method: this.endpoint.method,
            url: this.url,
            urlQueries: this.formState.queryParameters,
            headers: this.formState.headers,
            body: this.#convertFormStateToBody(),
        });
    }

    #convertFormStateToBody(): ResolvedExampleEndpointRequest | undefined {
        if (this.formState.body == null) {
            return undefined;
        }
        return visitDiscriminatedUnion(this.formState.body, "type")._visit<ResolvedExampleEndpointRequest | undefined>({
            json: ({ value }) => ({ type: "json", value }),
            "form-data": ({ value }): ResolvedExampleEndpointRequest.Form | undefined => {
                const properties =
                    this.endpoint.requestBody?.shape.type === "formData"
                        ? this.endpoint.requestBody.shape.properties
                        : [];
                const newValue: Record<string, ResolvedFormValue> = {};
                for (const [key, v] of Object.entries(value)) {
                    const property = properties.find((property) => property.key === key);
                    const convertedV = convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest(
                        v,
                        property,
                        this.isFileForgeHackEnabled,
                    );
                    if (convertedV != null) {
                        newValue[key] = convertedV;
                    }
                }
                if (isEmpty(newValue)) {
                    return undefined;
                }
                return { type: "form", value: newValue };
            },
            "octet-stream": ({ value }): ResolvedExampleEndpointRequest.Bytes | undefined =>
                value != null ? { type: "bytes", fileName: value.name, value: undefined } : undefined,
            _other: () => undefined,
        });
    }
}
