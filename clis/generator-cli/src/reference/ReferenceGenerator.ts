import fs from "fs";
import { FernGeneratorCli } from "../configuration/generated";
import {
    EndpointReference,
    LinkedText,
    ParameterReference,
    ReferenceSection,
    RelativeLocation,
    RootPackageReferenceSection,
} from "../configuration/generated/api";
import { StreamWriter, StringWriter, Writer } from "../utils/Writer";

export class ReferenceGenerator {
    private referenceConfig: FernGeneratorCli.ReferenceConfig;

    constructor({
        referenceConfig,
    }: {
        referenceConfig: FernGeneratorCli.ReferenceConfig;
    }) {
        this.referenceConfig = referenceConfig;
    }

    public async generate({
        output,
    }: {
        output: fs.WriteStream;
    }): Promise<void> {
        const writer = new StreamWriter(output);
        writer.writeLine("# Reference");

        if (this.referenceConfig.rootSection != null) {
            this.writeRootSection({
                section: this.referenceConfig.rootSection,
                writer,
            });
        }
        for (const section of this.referenceConfig.sections) {
            this.writeSection({ section, writer });
        }
        writer.end();
    }

    private writeRootSection({
        section,
        writer,
    }: {
        section: RootPackageReferenceSection;
        writer: Writer;
    }): void {
        if (section.description != null) {
            writer.writeLine(`${section.description}`);
        }
        for (const endpoint of section.endpoints) {
            this.writeEndpoint({ endpoint, writer });
        }
    }

    private writeSection({
        section,
        writer,
    }: {
        section: ReferenceSection;
        writer: Writer;
    }): void {
        writer.writeLine(`## ${section.title}`);
        if (section.description != null) {
            writer.writeLine(`${section.description}`);
        }
        for (const endpoint of section.endpoints) {
            this.writeEndpoint({ endpoint, writer });
        }
    }

    private writeEndpoint({
        endpoint,
        writer,
    }: {
        endpoint: EndpointReference;
        writer: Writer;
    }): void {
        const stringWriter = new StringWriter();
        if (endpoint.description != null) {
            stringWriter.writeLine(
                `#### 📝 Description\n\n${this.writeIndentedBlock(this.writeIndentedBlock(endpoint.description))}\n`
            );
        }
        stringWriter.writeLine(
            `#### 🔌 Usage\n\n${this.writeIndentedBlock(
                this.writeIndentedBlock(
                    "```" +
                        this.referenceConfig.language.toLowerCase() +
                        "\n" +
                        endpoint.snippet +
                        "\n```"
                )
            )}\n`
        );
        if (endpoint.parameters.length > 0) {
            stringWriter.writeLine(
                `#### ⚙️ Parameters\n\n${this.writeIndentedBlock(
                    endpoint.parameters
                        .map((parameter) =>
                            this.writeIndentedBlock(
                                this.writeParameter(parameter)
                            )
                        )
                        .join("\n\n")
                )}\n`
            );
        }

        let linkedSnippet = this.wrapInLinksAndJoin(
            endpoint.title.snippetParts
        );
        if (endpoint.title.returnValue != null) {
            linkedSnippet += ` -> ${this.wrapInLink(endpoint.title.returnValue.text, endpoint.title.returnValue.location)}`;
        }
        writer.writeLine(
            `<details><summary><code>${linkedSnippet}</code></summary>`
        );
        writer.writeLine(this.writeIndentedBlock(stringWriter.toString()));
        writer.writeLine("</details>\n");
    }

    private writeParameter(parameter: ParameterReference): string {
        const desc = parameter.description?.match(/[^\r\n]+/g)?.length;
        const containsLineBreak = desc != null && desc > 1;
        return `**${parameter.name}:** \`${this.wrapInLink(parameter.type, parameter.location)}\` ${
            parameter.description != null
                ? (containsLineBreak ? "\n\n" : "— ") + parameter.description
                : ""
        }
    `;
    }

    private writeIndentedBlock(content: string): string {
        return `<dl>\n<dd>\n\n${content}\n</dd>\n</dl>`;
    }

    private wrapInLinksAndJoin(content: LinkedText[]): string {
        return content
            .map(({ text, location }) => this.wrapInLink(text, location))
            .join("");
    }

    private wrapInLink(content: string, link?: RelativeLocation) {
        return link != null ? `<a href="${link.path}">${content}</a>` : content;
    }
}
