import { isNonNullish, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { PlaygroundFormDataEntryValue } from "../../types";
import { buildPath, indentAfter } from "./common";
import { PlaygroundCodeSnippetBuilder } from "./types";

interface PythonRequestParams {
  json?: string;
  data?: string;
  files?: string;
}

export class PythonRequestSnippetBuilder extends PlaygroundCodeSnippetBuilder {
  // TODO: write more tests for this
  #buildRequests({ json, data, files }: PythonRequestParams) {
    return `# ${this.context.node.title} (${this.context.endpoint.method} ${buildPath(this.context.endpoint.path)})
response = requests.${this.context.endpoint.method.toLowerCase()}(
  "${this.url}",
  headers=${indentAfter(JSON.stringify(this.formState.headers, undefined, 2), 2, 0)},${json != null ? `\n  json=${indentAfter(json, 2, 0)},` : ""}${
    data != null ? `\n  data=${indentAfter(data, 2, 0)},` : ""
  }${files != null ? `\n  files=${indentAfter(files, 2, 0)},` : ""}
)

print(response.json())`;
  }

  public override build(): string {
    const imports = ["requests"];

    if (this.formState.body == null) {
      return `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${this.#buildRequests({})}`;
    }

    return visitDiscriminatedUnion(this.formState.body, "type")._visit<string>({
      json: ({ value }) => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${this.#buildRequests({ json: JSON.stringify(this.maybeWrapJsonBody(value), undefined, 2) })}`,
      "form-data": ({ value }) => {
        const singleFiles = Object.entries(value)
          .filter(
            (
              entry
            ): entry is [string, PlaygroundFormDataEntryValue.SingleFile] =>
              PlaygroundFormDataEntryValue.isSingleFile(entry[1])
          )
          .map(([k, v]) => {
            if (v.value == null) {
              return undefined;
            }
            return `('${k}', ('${v.value.name}', open('${v.value.name}', 'rb'))),`;
          })
          .filter(isNonNullish);
        const fileArrays = Object.entries(value)
          .filter(
            (
              entry
            ): entry is [string, PlaygroundFormDataEntryValue.MultipleFiles] =>
              PlaygroundFormDataEntryValue.isMultipleFiles(entry[1])
          )
          .map(([k, v]) => {
            const fileStrings = v.value.map(
              (file) => `('${k}', ('${file.name}', open('${file.name}', 'rb')))`
            );
            if (fileStrings.length === 0) {
              return;
            }
            return fileStrings.join(",\n");
          })
          .filter(isNonNullish);

        const fileEntries = [...singleFiles, ...fileArrays].join("\n");
        const files =
          fileEntries.length > 0
            ? `[\n${indentAfter(fileEntries, 2)}\n]`
            : undefined;

        const dataEntries = Object.entries(value)
          .filter(
            (entry): entry is [string, PlaygroundFormDataEntryValue.Json] =>
              PlaygroundFormDataEntryValue.isJson(entry[1])
          )
          .map(([k, v]) =>
            v.value == null
              ? undefined
              : `'${k}': json.dumps(${indentAfter(JSON.stringify(v.value, undefined, 2), 2, 0)}),`
          )
          .filter(isNonNullish)
          .join("\n");

        const data =
          dataEntries.length > 0
            ? `{\n${indentAfter(dataEntries, 2)}\n}`
            : undefined;

        if (data != null) {
          imports.push("json");
        }

        return `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${this.#buildRequests({ data, files })}`;
      },
      "octet-stream": (
        f
      ) => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${this.#buildRequests({ data: f.value != null ? `open('${f.value?.name}', 'rb').read()` : undefined })}`,
      _other: () => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${this.#buildRequests({})}`,
    });
  }
}
