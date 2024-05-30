import fs from "fs";
import { camelCase, upperFirst } from "lodash-es";
import { FernGeneratorCli } from "../configuration/generated";
import { StreamWriter, StringWriter, Writer } from "../utils/Writer";
import { Block } from "./Block";
import { BlockMerger } from "./BlockMerger";
import { ReadmeParser } from "./ReadmeParser";

export class ReadmeGenerator {
    private readmeParser: ReadmeParser;
    private readmeConfig: FernGeneratorCli.ReadmeConfig;
    private originalReadme: string | undefined;
    private languageTitle: string;
    private organizationPascalCase: string;

    constructor({
        readmeParser,
        readmeConfig,
        originalReadme,
    }: {
        readmeParser: ReadmeParser;
        readmeConfig: FernGeneratorCli.ReadmeConfig;
        originalReadme: string | undefined;
    }) {
        this.readmeParser = readmeParser;
        this.readmeConfig = readmeConfig;
        this.originalReadme = originalReadme;
        this.languageTitle = this.readmeConfig.language.title;
        this.organizationPascalCase = pascalCase(this.readmeConfig.organization);
    }

    public async generateReadme({ output }: { output: fs.WriteStream }): Promise<void> {
        const blocks = this.generateBlocks();

        const writer = new StreamWriter(output);
        this.writeHeader({ writer });
        this.writeBlocks({
            writer,
            blocks: this.mergeBlocks({ blocks }),
        });
        writer.end();

        return;
    }

    private generateBlocks(): Block[] {
        const blocks: Block[] = [];

        if (this.readmeConfig.docsLink != null) {
            blocks.push(this.generateDocumentation({ docsLink: this.readmeConfig.docsLink }));
        }
        if (this.readmeConfig.requirements != null) {
            blocks.push(this.generateRequirements({ requirements: this.readmeConfig.requirements }));
        }
        if (this.readmeConfig.language != null && this.readmeConfig.language.publishInfo != null) {
            blocks.push(this.generateInstallation({ language: this.readmeConfig.language }));
        }
        for (const feature of this.readmeConfig.features ?? []) {
            if (this.shouldSkipFeature({ feature })) {
                continue;
            }
            blocks.push(
                this.generateFeatureBlock({
                    feature,
                }),
            );
        }
        blocks.push(this.generateContributing());

        return blocks;
    }

    private generateFeatureBlock({ feature }: { feature: FernGeneratorCli.ReadmeFeature }): Block {
        const writer = new StringWriter();
        writer.writeLine(`## ${featureIDToTitle(feature.id)}`);
        writer.writeLine();
        if (feature.description != null) {
            writer.writeLine(feature.description);
        }
        feature.snippets?.forEach((snippet, index) => {
            if (index > 0) {
                writer.writeLine();
            }
            writer.writeCodeBlock(this.readmeConfig.language.format, snippet);
        });
        if (feature.addendum != null) {
            writer.writeLine(feature.addendum);
        }
        writer.writeLine();
        return new Block({
            id: feature.id,
            content: writer.toString(),
        });
    }

    private mergeBlocks({ blocks }: { blocks: Block[] }): Block[] {
        if (this.originalReadme == null) {
            return blocks;
        }
        const parsed = this.readmeParser.parse({ content: this.originalReadme });
        const merger = new BlockMerger({
            original: parsed.blocks,
            updated: blocks,
        });
        return merger.merge();
    }

    private writeBlocks({ writer, blocks }: { writer: Writer; blocks: Block[] }): void {
        for (const block of blocks) {
            block.write(writer);
        }
    }

    private writeHeader({ writer }: { writer: Writer }): void {
        writer.writeLine(`# ${this.organizationPascalCase} ${this.languageTitle} Library`);
        writer.writeLine();
        if (this.readmeConfig.bannerLink != null) {
            this.writeBanner({ writer, bannerLink: this.readmeConfig.bannerLink });
        }
        this.writeFernShield({ writer });
        if (this.readmeConfig.language != null) {
            this.writeShield({
                writer,
                language: this.readmeConfig.language,
            });
        }
        writer.writeLine();
        writer.writeLine(
            `The ${this.organizationPascalCase} ${this.languageTitle} library provides convenient access to the ${this.organizationPascalCase} API from ${this.languageTitle}.`,
        );
        writer.writeLine();
    }

    private writeBanner({ writer, bannerLink }: { writer: Writer; bannerLink: string }): void {
        writer.writeLine(`![](${bannerLink})`);
        writer.writeLine();
    }

    private writeFernShield({ writer }: { writer: Writer }): void {
        writer.writeLine(
            "[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)",
        );
    }

    private generateDocumentation({ docsLink }: { docsLink: string }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Documentation");
        writer.writeLine();
        writer.writeLine(`${this.organizationPascalCase} documentation is available [here](${docsLink}).`);
        writer.writeLine();
        return new Block({
            id: "DOCUMENTATION",
            content: writer.toString(),
        });
    }

    private generateRequirements({ requirements }: { requirements: string[] }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Requirements");
        writer.writeLine();
        if (requirements.length === 1) {
            writer.writeLine(`This SDK requires ${requirements[0]}.`);
        } else {
            writer.writeLine("This SDK requires:");
            for (const requirement of requirements) {
                writer.writeLine(`- ${requirement}`);
            }
        }
        writer.writeLine();
        return new Block({
            id: "REQUIREMENTS",
            content: writer.toString(),
        });
    }

    private generateInstallation({ language }: { language: FernGeneratorCli.LanguageInfo }): Block {
        if (language.publishInfo == null) {
            // This should be unreachable.
            throw new Error("publish information is required for installation block");
        }
        const writer = new StringWriter();
        writer.writeLine("## Installation");
        writer.writeLine();
        switch (language.type) {
            case "typescript":
                this.writeInstallationForNPM({
                    writer,
                    npm: language.publishInfo,
                });
                break;
            case "python":
                this.writeInstallationForPyPi({
                    writer,
                    pypi: language.publishInfo,
                });
                break;
            case "java":
                this.writeInstallationForMaven({
                    writer,
                    maven: language.publishInfo,
                });
                break;
            case "go":
                this.writeInstallationForGo({
                    writer,
                    go: language.publishInfo,
                });
                break;
            case "ruby":
                this.writeInstallationForRubyGems({
                    writer,
                    rubyGems: language.publishInfo,
                });
                break;
            case "csharp":
                this.writeInstallationForNuget({
                    writer,
                    nuget: language.publishInfo,
                });
                break;
            default:
                assertNever(language);
        }
        return new Block({
            id: "INSTALLATION",
            content: writer.toString(),
        });
    }

    private writeInstallationForNPM({ writer, npm }: { writer: Writer; npm: FernGeneratorCli.NpmPublishInfo }): void {
        writer.writeLine("```sh");
        writer.writeLine(`npm i -s ${npm.packageName}`);
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForPyPi({
        writer,
        pypi,
    }: {
        writer: Writer;
        pypi: FernGeneratorCli.PypiPublishInfo;
    }): void {
        writer.writeLine("```sh");
        writer.writeLine(`pip install ${pypi.packageName}`);
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForMaven({
        writer,
        maven,
    }: {
        writer: Writer;
        maven: FernGeneratorCli.MavenPublishInfo;
    }): void {
        writer.writeLine("### Gradle");
        writer.writeLine();
        writer.writeLine("Add the dependency in your `build.gradle` file:");
        writer.writeLine();
        writer.writeLine("```groovy");
        writer.writeLine("dependencies {");
        writer.writeLine(`  implementation '${maven.group}:${maven.artifact}'`);
        writer.writeLine("}");
        writer.writeLine("```");
        writer.writeLine();

        writer.writeLine("### Maven");
        writer.writeLine();
        writer.writeLine("Add the dependency in your `pom.xml` file:");
        writer.writeLine();
        writer.writeLine("```xml");
        writer.writeLine("<dependency>");
        writer.writeLine(`  <groupId>${maven.group}</groupId>`);
        writer.writeLine(`  <artifactId>${maven.artifact}</artifactId>`);
        writer.writeLine(`  <version>${maven.version}</version>`);
        writer.writeLine("</dependency>");
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForGo({ writer, go }: { writer: Writer; go: FernGeneratorCli.GoPublishInfo }): void {
        writer.writeLine("```sh");
        writer.write(`go get github.com/${go.owner}/${go.repo}`);
        const majorVersion = getMajorVersion(go.version);
        if (!majorVersion.startsWith("0") && !majorVersion.startsWith("1")) {
            // For Go, we need to append the major version to the module path for any release greater than v1.X.X.
            writer.write(`/v${majorVersion}`);
        }
        writer.writeLine();
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForRubyGems({
        writer,
        rubyGems,
    }: {
        writer: Writer;
        rubyGems: FernGeneratorCli.RubyGemsPublishInfo;
    }): void {
        writer.writeLine("```sh");
        writer.writeLine(`gem install ${rubyGems.packageName}`);
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForNuget({
        writer,
        nuget,
    }: {
        writer: Writer;
        nuget: FernGeneratorCli.NugetPublishInfo;
    }): void {
        writer.writeLine("```sh");
        writer.writeLine(`nuget install ${nuget.packageName}`);
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeShield({ writer, language }: { writer: Writer; language: FernGeneratorCli.LanguageInfo }): void {
        switch (language.type) {
            case "typescript": {
                const npm = language.publishInfo;
                if (npm == null) {
                    return;
                }
                this.writeShieldForNPM({
                    writer,
                    npm,
                });
                return;
            }
            case "python": {
                const pypi = language.publishInfo;
                if (pypi == null) {
                    return;
                }
                this.writeShieldForPyPi({
                    writer,
                    pypi,
                });
                return;
            }
            case "java": {
                const maven = language.publishInfo;
                if (maven == null) {
                    return;
                }
                this.writeShieldForMaven({
                    writer,
                    maven,
                });
                return;
            }
            case "go": {
                const go = language.publishInfo;
                if (go == null) {
                    return;
                }
                this.writeShieldForGo({
                    writer,
                    go,
                });
                return;
            }
            case "ruby": {
                const rubyGems = language.publishInfo;
                if (rubyGems == null) {
                    return;
                }
                this.writeShieldForRubyGems({
                    writer,
                    rubyGems,
                });
                return;
            }
            case "csharp": {
                const nuget = language.publishInfo;
                if (nuget == null) {
                    return;
                }
                this.writeShieldForNuget({
                    writer,
                    nuget,
                });
                return;
            }
            default:
                assertNever(language);
        }
    }

    private writeShieldForNPM({ writer, npm }: { writer: Writer; npm: FernGeneratorCli.NpmPublishInfo }): void {
        writer.write("[![npm shield]");
        writer.write(`(https://img.shields.io/npm/v/${npm.packageName})]`);
        writer.writeLine(`(https://www.npmjs.com/package/${npm.packageName})`);
    }

    private writeShieldForPyPi({ writer, pypi }: { writer: Writer; pypi: FernGeneratorCli.PypiPublishInfo }): void {
        writer.write("[![pypi]");
        writer.write(`(https://img.shields.io/pypi/v/${pypi.packageName})]`);
        writer.writeLine(`(https://pypi.python.org/pypi/${pypi.packageName})`);
    }

    private writeShieldForMaven({ writer, maven }: { writer: Writer; maven: FernGeneratorCli.MavenPublishInfo }): void {
        writer.write("[![Maven Central]");
        writer.write(`(https://img.shields.io/maven-central/v/${maven.artifact})]`);
        writer.writeLine(`(https://central.sonatype.com/artifact/${maven.group}/${maven.artifact})`);
    }

    private writeShieldForGo({ writer, go }: { writer: Writer; go: FernGeneratorCli.GoPublishInfo }): void {
        writer.write("[![go shield]");
        writer.write("(https://img.shields.io/badge/go-docs-blue)]");
        writer.writeLine(`(https://pkg.go.dev/github.com/${go.owner}/${go.repo})`);
    }

    private writeShieldForRubyGems({
        writer,
        rubyGems,
    }: {
        writer: Writer;
        rubyGems: FernGeneratorCli.RubyGemsPublishInfo;
    }): void {
        writer.write("[![gems shield]");
        writer.write(`(https://img.shields.io/gem/v/${rubyGems.packageName})]`);
        writer.writeLine(`(https://rubygems.org/gems/${rubyGems.packageName})`);
    }

    private writeShieldForNuget({ writer, nuget }: { writer: Writer; nuget: FernGeneratorCli.NugetPublishInfo }): void {
        writer.write("[![nuget shield]");
        writer.write(`(https://img.shields.io/nuget/v/${nuget.packageName})]`);
        writer.writeLine(`(https://nuget.org/packages/${nuget.packageName})`);
    }

    private generateContributing(): Block {
        return new Block({
            id: "contributing",
            content: `## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
`,
        });
    }

    private shouldSkipFeature({ feature }: { feature: FernGeneratorCli.ReadmeFeature }): boolean {
        return !feature.snippetsAreOptional && (feature.snippets == null || feature.snippets.length === 0);
    }
}

function featureIDToTitle(featureID: string): string {
    return featureID
        .split("_")
        .map((s) => pascalCase(s))
        .join(" ");
}

function pascalCase(s: string): string {
    return upperFirst(camelCase(s));
}

function getMajorVersion(version: string): string {
    return version.split(".")[0] ?? "0";
}

function assertNever(x: never): never {
    throw new Error("unexpected value: " + JSON.stringify(x));
}
