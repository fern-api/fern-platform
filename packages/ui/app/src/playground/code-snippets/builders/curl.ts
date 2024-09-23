import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty } from "lodash-es";
import { convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest } from "../../types";
import { PlaygroundCodeSnippetBuilder } from "./types";

export class CurlSnippetBuilder extends PlaygroundCodeSnippetBuilder {
    private isFileForgeHackEnabled: boolean = false;

    public setFileForgeHackEnabled(isFileForgeHackEnabled: boolean): CurlSnippetBuilder {
        this.isFileForgeHackEnabled = isFileForgeHackEnabled;
        return this;
    }

    public override build(): string {
        return ApiDefinition.convertToCurl({
            method: this.endpoint.method,
            url: this.url,
            searchParams: this.formState.queryParameters,
            headers: this.formState.headers,
            body: this.#convertFormStateToBody(),
        });
    }

    #convertFormStateToBody(): ApiDefinition.ExampleEndpointCall | undefined {
        if (this.formState.body == null) {
            return undefined;
        }
        return visitDiscriminatedUnion(this.formState.body, "type")._visit<
            ApiDefinition.ExampleEndpointCall["requestBody"] | undefined
        >({
            json: ({ value }) => ({ type: "json", value }),
            "form-data": ({ value }): ApiDefinition.ExampleEndpointRequest.Form | undefined => {
                const properties =
                    this.endpoint.request?.body.type === "formData" ? this.endpoint.request.body.fields : [];
                const newValue: Record<string, ApiDefinition.FormDataField> = {};
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
            "octet-stream": ({ value }): ApiDefinition.ExampleEndpointRequest.Bytes | undefined =>
                value != null ? { type: "bytes", fileName: value.name, value: undefined } : undefined,
            _other: () => undefined,
        });
    }
}
