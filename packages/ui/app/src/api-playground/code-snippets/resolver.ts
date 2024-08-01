import { APIV1Read } from "@fern-api/fdr-sdk";
import { SnippetTemplateResolver } from "@fern-api/template-resolver";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty } from "lodash-es";
import { UnreachableCaseError } from "ts-essentials";
import { stringifyHttpRequestExampleToCurl } from "../../api-page/examples/stringifyHttpRequestExampleToCurl";
import {
    ResolvedEndpointDefinition,
    ResolvedEndpointPathParts,
    ResolvedExampleEndpointRequest,
    ResolvedFormValue,
    stringifyResolvedEndpointPathPartsTemplate,
} from "../../resolver/types";
import {
    PlaygroundAuthState,
    PlaygroundEndpointRequestFormState,
    PlaygroundFormDataEntryValue,
    convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest,
} from "../types";
import {
    buildAuthHeaders,
    buildEndpointUrl,
    convertToCustomSnippetPayload,
    indentAfter,
    unknownToString,
} from "../utils";

export class PlaygroundCodeSnippetResolverBuilder {
    constructor(
        private endpoint: ResolvedEndpointDefinition,
        private isSnippetTemplatesEnabled: boolean,
        private docsHost: string,
    ) {}

    public create(
        authState: PlaygroundAuthState,
        formState: PlaygroundEndpointRequestFormState,
    ): PlaygroundCodeSnippetResolver {
        return new PlaygroundCodeSnippetResolver(
            this.endpoint,
            authState,
            formState,
            false,
            this.isSnippetTemplatesEnabled,
            this.docsHost.includes("fileforge"),
        );
    }

    public createRedacted(
        authState: PlaygroundAuthState,
        formState: PlaygroundEndpointRequestFormState,
    ): PlaygroundCodeSnippetResolver {
        return new PlaygroundCodeSnippetResolver(
            this.endpoint,
            authState,
            formState,
            true,
            this.isSnippetTemplatesEnabled,
            this.docsHost.includes("fileforge"),
        );
    }
}

export class PlaygroundCodeSnippetResolver {
    // TODO: use Headers class for case-insensitive keyes
    private headers: Record<string, unknown> = {};
    private url: string;
    private typescriptSdkResolver: SnippetTemplateResolver | undefined;
    private pythonRequestsResolver: SnippetTemplateResolver | undefined;

    public resolve(lang: "curl" | "python" | "typescript", apiDefinition?: APIV1Read.ApiDefinition): string {
        if (lang === "curl") {
            return this.toCurl();
        } else if (lang === "typescript") {
            return this.toTypescriptSdkSnippet(apiDefinition) ?? this.toTypescriptFetch();
        } else if (lang === "python") {
            return this.toPythonSdkSnippet(apiDefinition) ?? this.toPythonRequests();
        } else {
            throw new UnreachableCaseError(lang);
        }
    }

    constructor(
        public endpoint: ResolvedEndpointDefinition,
        authState: PlaygroundAuthState,
        private formState: PlaygroundEndpointRequestFormState,
        isAuthHeadersRedacted: boolean,
        isSnippetTemplatesEnabled: boolean,
        private isFileForgeHackEnabled: boolean,
    ) {
        const authHeaders = buildAuthHeaders(endpoint.auth, authState, { redacted: isAuthHeadersRedacted });
        this.headers = { ...authHeaders, ...formState.headers };
        if (endpoint.method !== "GET" && endpoint.requestBody?.contentType != null) {
            this.headers["Content-Type"] = endpoint.requestBody.contentType;
        }

        // TODO: wire through the environment from hook
        this.url = buildEndpointUrl(endpoint, formState);

        if (isSnippetTemplatesEnabled && endpoint.snippetTemplates != null) {
            if (endpoint.snippetTemplates.typescript != null) {
                this.typescriptSdkResolver = new SnippetTemplateResolver({
                    payload: convertToCustomSnippetPayload(formState),
                    endpointSnippetTemplate: {
                        sdk: {
                            type: "typescript",
                            package: "",
                            version: "",
                        },
                        endpointId: {
                            path: stringifyResolvedEndpointPathPartsTemplate(endpoint.path),
                            method: endpoint.method,
                        },
                        snippetTemplate: endpoint.snippetTemplates.typescript,
                    },
                });
            }

            if (endpoint.snippetTemplates.python != null) {
                this.pythonRequestsResolver = new SnippetTemplateResolver({
                    payload: convertToCustomSnippetPayload(formState),
                    endpointSnippetTemplate: {
                        sdk: {
                            type: "python",
                            package: "",
                            version: "",
                        },
                        endpointId: {
                            path: stringifyResolvedEndpointPathPartsTemplate(endpoint.path),
                            method: endpoint.method,
                        },
                        snippetTemplate: endpoint.snippetTemplates.python,
                    },
                });
            }
        }
    }

    public toCurl(): string {
        return stringifyHttpRequestExampleToCurl({
            method: this.endpoint.method,
            url: this.url,
            urlQueries: this.formState.queryParameters,
            headers: this.headers,
            body:
                this.formState.body == null
                    ? undefined
                    : visitDiscriminatedUnion(this.formState.body, "type")._visit<
                          ResolvedExampleEndpointRequest | undefined
                      >({
                          json: ({ value }) => ({ type: "json", value }),
                          "form-data": ({ value }): ResolvedExampleEndpointRequest.Form | undefined => {
                              const properties =
                                  this.endpoint.requestBody?.shape.type === "formData"
                                      ? this.endpoint.requestBody.shape.properties
                                      : [];
                              const newValue: Record<string, ResolvedFormValue> = {};
                              for (const [key, v] of Object.entries(value)) {
                                  const property = properties.find((property) => property.key === key);
                                  const convertedV =
                                      convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest(
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
                      }),
        });
    }

    public toTypescriptFetch(): string {
        const endpoint = this.endpoint;
        const headers = { ...this.headers };

        // TODO: ensure case insensitivity
        if (headers["Content-Type"] === "multipart/form-data") {
            delete headers["Content-Type"]; // fetch will set this automatically
        }

        function buildFetch(body: string | undefined) {
            if (endpoint == null) {
                return "";
            }
            return `// ${endpoint.title} (${endpoint.method} ${endpoint.path
                .map((part) => (part.type === "literal" ? part.value : `:${part.key}`))
                .join("")})
const response = await fetch("${this.url}", {
  method: "${this.endpoint.method}",
  headers: ${indentAfter(JSON.stringify(headers, undefined, 2), 2, 0)},${!isEmpty(body) ? `\n  body: ${body},` : ""}
});

const body = await response.json();
console.log(body);`;
        }
        buildFetch.bind(this);

        if (this.formState.body == null) {
            return buildFetch(undefined);
        }

        return visitDiscriminatedUnion(this.formState.body, "type")._visit<string>({
            "octet-stream": () => buildFetch('document.querySelector("input[type=file]").files[0]'), // TODO: implement this
            json: ({ value }) =>
                buildFetch(
                    value != null
                        ? indentAfter(`JSON.stringify(${JSON.stringify(value, undefined, 2)})`, 2, 0)
                        : undefined,
                ),
            "form-data": ({ value }) => {
                const file = Object.entries(value)
                    .filter(([, v]) => v.type === "file")
                    .map(([k]) => {
                        return `const ${k}File = document.getElementById("${k}").files[0];
formData.append("${k}", ${k}File);`;
                    })
                    .join("\n\n");

                const fileArrays = Object.entries(value)
                    .filter(([, v]) => v.type === "fileArray")
                    .map(([k]) => {
                        return `const ${k}Files = document.getElementById("${k}").files;
${k}Files.forEach((file) => {
  formData.append("${k}", file);
});`;
                    })
                    .join("\n\n");

                const jsons = Object.entries(value)
                    .filter(([, v]) => v.type === "json")
                    .map(([k, v]) => {
                        return `formData.append("${k}", ${indentAfter(`JSON.stringify(${JSON.stringify(v.value, undefined, 2)})`, 2, 0)});`;
                    })
                    .join("\n\n");

                const appendStatements = [file, fileArrays, jsons].filter((v) => v.length > 0).join("\n\n");

                return `// Create a new FormData instance
const formData = new FormData();${appendStatements.length > 0 ? "\n\n" + appendStatements : ""}

${buildFetch("formData")}`;
            },
            _other: () => buildFetch(undefined),
        });
    }

    public toPythonRequests(): string {
        const endpoint = this.endpoint;
        const headers = { ...this.headers };

        const imports = ["requests"];

        interface PythonRequestParams {
            json?: string;
            data?: string;
            files?: string;
        }

        function buildRequests({ json, data, files }: PythonRequestParams) {
            if (endpoint == null) {
                return "";
            }
            return `# ${endpoint.title} (${endpoint.method} ${buildPath(endpoint.path)})
response = requests.${endpoint.method.toLowerCase()}(
  "${this.url}",
  headers=${indentAfter(JSON.stringify(headers, undefined, 2), 2, 0)},${json != null ? `\n  json=${indentAfter(json, 2, 0)},` : ""}${
      data != null ? `\n  data=${indentAfter(data, 2, 0)},` : ""
  }${files != null ? `\n  files=${indentAfter(files, 2, 0)},` : ""}
)

print(response.json())`;
        }
        buildRequests.bind(this);

        if (this.formState.body == null) {
            return `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({})}`;
        }

        return visitDiscriminatedUnion(this.formState.body, "type")._visit<string>({
            json: ({ value }) => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({ json: JSON.stringify(value, undefined, 2) })}`,
            "form-data": ({ value }) => {
                const singleFiles = Object.entries(value)
                    .filter((entry): entry is [string, PlaygroundFormDataEntryValue.SingleFile] =>
                        PlaygroundFormDataEntryValue.isSingleFile(entry[1]),
                    )
                    .map(([k, v]) => {
                        if (v.value == null) {
                            return undefined;
                        }
                        return `'${k}': ('${v.value.name}', open('${v.value.name}', 'rb')),`;
                    })
                    .filter(isNonNullish);
                const fileArrays = Object.entries(value)
                    .filter((entry): entry is [string, PlaygroundFormDataEntryValue.MultipleFiles] =>
                        PlaygroundFormDataEntryValue.isMultipleFiles(entry[1]),
                    )
                    .map(([k, v]) => {
                        const fileStrings = v.value.map((file) => `('${file.name}', open('${file.name}', 'rb'))`);
                        if (fileStrings.length === 0) {
                            return;
                        }
                        return `'${k}': [${fileStrings.length === 0 ? fileStrings[0] : indentAfter(`\n${fileStrings.join(",\n")},\n`, 2, 0)}],`;
                    })
                    .filter(isNonNullish);

                const fileEntries = [...singleFiles, ...fileArrays].join("\n");
                const files = fileEntries.length > 0 ? `{\n${indentAfter(fileEntries, 2)}\n}` : undefined;

                const dataEntries = Object.entries(value)
                    .filter((entry): entry is [string, PlaygroundFormDataEntryValue.Json] =>
                        PlaygroundFormDataEntryValue.isJson(entry[1]),
                    )
                    .map(([k, v]) =>
                        v.value == null
                            ? undefined
                            : `'${k}': json.dumps(${indentAfter(JSON.stringify(v.value, undefined, 2), 2, 0)}),`,
                    )
                    .filter(isNonNullish)
                    .join("\n");

                const data = dataEntries.length > 0 ? `{\n${indentAfter(dataEntries, 2)}\n}` : undefined;

                if (data != null) {
                    imports.push("json");
                }

                return `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({ data, files })}`;
            },
            "octet-stream": (f) => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({ data: f.value != null ? `open('${f.value?.name}', 'rb').read()` : undefined })}`,
            _other: () => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({})}`,
        });
    }

    public toTypescriptSdkSnippet(apiDefinition?: APIV1Read.ApiDefinition): string | undefined {
        if (this.typescriptSdkResolver == null) {
            return undefined;
        }

        const resolvedTemplate = this.typescriptSdkResolver.resolve(apiDefinition);

        if (resolvedTemplate.type === "typescript") {
            return resolvedTemplate.client;
        }
        return undefined;
    }

    public toPythonSdkSnippet(apiDefinition?: APIV1Read.ApiDefinition): string | undefined {
        if (this.pythonRequestsResolver == null) {
            return undefined;
        }

        const resolvedTemplate = this.pythonRequestsResolver.resolve(apiDefinition);

        if (resolvedTemplate.type === "python") {
            return resolvedTemplate.sync_client;
        }
        return undefined;
    }
}

function buildPath(path: ResolvedEndpointPathParts[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const stateValue = unknownToString(pathParameters?.[part.key]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + part.key;
            }
            return part.value;
        })
        .join("");
}
