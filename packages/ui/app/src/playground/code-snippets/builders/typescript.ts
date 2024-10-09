import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { isEmpty } from "lodash-es";
import { buildPath, indentAfter } from "./common";
import { PlaygroundCodeSnippetBuilder } from "./types";

export class TypescriptFetchSnippetBuilder extends PlaygroundCodeSnippetBuilder {
    // TODO: write more tests for this
    #buildFetch(body: string | undefined): string {
        return `// ${this.context.node.title} (${this.context.endpoint.method} ${buildPath(this.context.endpoint.path)})
const response = await fetch("${this.url}", {
  method: "${this.context.endpoint.method}",
  headers: ${indentAfter(JSON.stringify(this.formState.headers, undefined, 2), 2, 0)},${!isEmpty(body) ? `\n  body: ${body},` : ""}
});

const body = await response.json();
console.log(body);`;
    }

    public override build(): string {
        if (this.formState.body == null) {
            return this.#buildFetch(undefined);
        }

        return visitDiscriminatedUnion(this.formState.body, "type")._visit<string>({
            "octet-stream": () => this.#buildFetch('document.querySelector("input[type=file]").files[0]'), // TODO: implement this
            json: ({ value }) =>
                this.#buildFetch(
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

${this.#buildFetch("formData")}`;
            },
            _other: () => this.#buildFetch(undefined),
        });
    }
}
