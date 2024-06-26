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

    constructor({ referenceConfig }: { referenceConfig: FernGeneratorCli.ReferenceConfig }) {
        this.referenceConfig = referenceConfig;
    }

    public async generate({ output }: { output: fs.WriteStream }): Promise<void> {
        const writer = new StreamWriter(output);
        writer.writeLine("# Reference");

        if (this.referenceConfig.rootSection !== undefined) {
            this.writeRootSection({ section: this.referenceConfig.rootSection, writer });
        }
        for (const section of this.referenceConfig.sections) {
            this.writeSection({ section, writer });
        }
        writer.end();
    }

    private writeRootSection({ section, writer }: { section: RootPackageReferenceSection; writer: Writer }): void {
        if (section.description !== undefined) {
            writer.writeLine(`${section.description}`);
        }
        for (const endpoint of section.endpoints) {
            this.writeEndpoint({ endpoint, writer });
        }
    }

    private writeSection({ section, writer }: { section: ReferenceSection; writer: Writer }): void {
        writer.writeLine(`## ${section.title}`);
        if (section.description !== undefined) {
            writer.writeLine(`${section.description}`);
        }
        for (const endpoint of section.endpoints) {
            this.writeEndpoint({ endpoint, writer });
        }
    }

    private writeEndpoint({ endpoint, writer }: { endpoint: EndpointReference; writer: Writer }): void {
        const stringWriter = new StringWriter();
        if (endpoint.description !== undefined) {
            stringWriter.writeLine(
                `#### 📝 Description\n\n${this.writeIndentedBlock(this.writeIndentedBlock(endpoint.description))}\n`,
            );
        }
        stringWriter.writeLine(
            `#### 🔌 Usage\n\n${this.writeIndentedBlock(
                this.writeIndentedBlock(
                    "```" + this.referenceConfig.language.toLowerCase() + "\n" + endpoint.snippet + "\n```",
                ),
            )}\n`,
        );
        if (endpoint.parameters.length > 0) {
            stringWriter.writeLine(
                `#### ⚙️ Parameters\n\n${this.writeIndentedBlock(
                    endpoint.parameters
                        .map((parameter) => this.writeIndentedBlock(this.writeParameter(parameter)))
                        .join("\n\n"),
                )}\n`,
            );
        }

        writer.writeLine(
            `<details><summary><code>${this.wrapInLinksAndJoin(endpoint.title.snippetParts)}</code></summary>`,
        );
        writer.writeLine(this.writeIndentedBlock(stringWriter.toString()));
        writer.writeLine("</details>\n");
    }

    private writeParameter(parameter: ParameterReference): string {
        const desc = parameter.description?.match(/[^\r\n]+/g)?.length;
        const containsLineBreak = desc !== undefined && desc > 1;
        return `**${parameter.name}:** \`${this.wrapInLink(parameter.type, parameter.location)}\` ${
            parameter.description !== undefined ? (containsLineBreak ? "\n\n" : "— ") + parameter.description : ""
        }
    `;
    }

    private writeIndentedBlock(content: string): string {
        return `<dl>\n<dd>\n\n${content}\n</dd>\n</dl>`;
    }

    private wrapInLinksAndJoin(content: LinkedText[]): string {
        return content.map(({ text, location }) => this.wrapInLink(text, location)).join("");
    }

    private wrapInLink(content: string, link?: RelativeLocation) {
        return link !== undefined ? `<a href="${link.path}">${content}</a>` : content;
    }
}
