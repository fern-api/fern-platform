import { cloneRepository } from "@fern-api/github";
import { camelCase, upperFirst } from "es-toolkit/string";
import fs from "fs";
import { FernGeneratorCli } from "../configuration/generated";
import { ReadmeFeature } from "../configuration/generated/api";
import { StreamWriter, StringWriter, Writer } from "../utils/Writer";
import { Block } from "./Block";
import { BlockMerger } from "./BlockMerger";
import { ReadmeParser } from "./ReadmeParser";

export class ReadmeGenerator {
    private ADVANCED_FEATURE_ID = "ADVANCED";
    private ADVANCED_FEATURES: Set<FernGeneratorCli.FeatureId> = new Set([
        FernGeneratorCli.StructuredFeatureId.Retries,
        FernGeneratorCli.StructuredFeatureId.Timeouts,
        FernGeneratorCli.StructuredFeatureId.CustomClient,
    ]);

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
        this.languageTitle = languageToTitle(this.readmeConfig.language);
        this.organizationPascalCase = pascalCase(
            this.readmeConfig.organization
        );
    }

    public async generateReadme({
        output,
    }: {
        output: fs.WriteStream;
    }): Promise<void> {
        const blocks = this.generateBlocks();

        const writer = new StreamWriter(output);
        this.writeHeader({ writer });
        this.writeBlocks({
            writer,
            blocks: await this.mergeBlocks({ blocks }),
        });
        writer.end();

        return;
    }

    private generateBlocks(): Block[] {
        const blocks: Block[] = [];

        if (this.readmeConfig.apiReferenceLink != null) {
            blocks.push(
                this.generateDocumentation({
                    docsLink: this.readmeConfig.apiReferenceLink,
                })
            );
        }
        if (this.readmeConfig.requirements != null) {
            blocks.push(
                this.generateRequirements({
                    requirements: this.readmeConfig.requirements,
                })
            );
        }
        if (
            this.readmeConfig.language != null &&
            this.readmeConfig.language.publishInfo != null
        ) {
            blocks.push(
                this.generateInstallation({
                    language: this.readmeConfig.language,
                })
            );
        }
        if (this.readmeConfig.referenceMarkdownPath != null) {
            blocks.push(
                this.generateReference({
                    referenceFile: this.readmeConfig.referenceMarkdownPath,
                })
            );
        }

        const coreFeatures =
            this.readmeConfig.features?.filter(
                (feat) => !this.isAdvanced(feat)
            ) ?? [];
        const advancedFeatures =
            this.readmeConfig.features?.filter((feat) =>
                this.isAdvanced(feat)
            ) ?? [];

        for (const feature of coreFeatures) {
            if (this.shouldSkipFeature({ feature })) {
                continue;
            }
            blocks.push(
                this.generateFeatureBlock({
                    feature,
                })
            );
        }

        const advancedFeatureBlock = this.generateNestedFeatureBlock({
            featureId: this.ADVANCED_FEATURE_ID,
            features: advancedFeatures,
        });
        if (advancedFeatureBlock != null) {
            blocks.push(advancedFeatureBlock);
        }

        blocks.push(this.generateContributing());

        return blocks;
    }

    private isAdvanced(feat: ReadmeFeature): boolean {
        if (this.ADVANCED_FEATURES.has(feat.id)) {
            return true;
        }
        return feat.advanced ?? false;
    }

    private generateNestedFeatureBlock({
        featureId,
        features,
    }: {
        featureId: string;
        features: FernGeneratorCli.ReadmeFeature[];
    }): Block | undefined {
        if (!this.shouldGenerateFeatures({ features })) {
            return undefined;
        }

        const writer = new StringWriter();
        writer.writeLine(`## ${featureIDToTitle(featureId)}`);
        writer.writeLine();

        for (const feature of features) {
            if (this.shouldSkipFeature({ feature })) {
                continue;
            }
            this.generateFeatureBlock({
                feature,
                heading: "###",
                maybeWriter: writer,
            });
        }
        return new Block({
            id: featureId,
            content: writer.toString(),
        });
    }

    private generateFeatureBlock({
        feature,
        heading = "##",
        maybeWriter,
    }: {
        feature: FernGeneratorCli.ReadmeFeature;
        heading?: "##" | "###";
        maybeWriter?: StringWriter;
    }): Block {
        const writer = maybeWriter ?? new StringWriter();
        writer.writeLine(`${heading} ${featureIDToTitle(feature.id)}`);
        writer.writeLine();
        if (feature.description != null) {
            writer.writeLine(feature.description);
        }
        feature.snippets?.forEach((snippet, index) => {
            if (index > 0) {
                writer.writeLine();
            }
            writer.writeCodeBlock(this.readmeConfig.language.type, snippet);
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

    private async mergeBlocks({
        blocks,
    }: {
        blocks: Block[];
    }): Promise<Block[]> {
        const originalReadmeContent = await this.getOriginalReadmeContent();
        if (originalReadmeContent == null) {
            return blocks;
        }
        const parsed = this.readmeParser.parse({
            content: originalReadmeContent,
        });
        const merger = new BlockMerger({
            original: parsed.blocks,
            updated: blocks,
        });
        return merger.merge();
    }

    private async getOriginalReadmeContent(): Promise<string | undefined> {
        if (this.originalReadme != null) {
            return this.originalReadme;
        }
        if (this.readmeConfig.remote != null) {
            const clonedRepository = await cloneRepository({
                githubRepository: this.readmeConfig.remote.repoUrl,
                installationToken: this.readmeConfig.remote.installationToken,
            });
            return await clonedRepository.getReadme();
        }
        return undefined;
    }

    private writeBlocks({
        writer,
        blocks,
    }: {
        writer: Writer;
        blocks: Block[];
    }): void {
        for (const block of blocks) {
            block.write(writer);
        }
    }

    private writeHeader({ writer }: { writer: Writer }): void {
        writer.writeLine(
            `# ${this.organizationPascalCase} ${this.languageTitle} Library`
        );
        writer.writeLine();
        if (this.readmeConfig.bannerLink != null) {
            this.writeBanner({
                writer,
                bannerLink: this.readmeConfig.bannerLink,
            });
        }
        this.writeFernShield({ writer });
        if (this.readmeConfig.language != null) {
            this.writeShield({
                writer,
                language: this.readmeConfig.language,
            });
        }
        writer.writeLine();
        this.writeIntroudction({ writer });
    }

    private writeBanner({
        writer,
        bannerLink,
    }: {
        writer: Writer;
        bannerLink: string;
    }): void {
        writer.writeLine(`![](${bannerLink})`);
        writer.writeLine();
    }

    private writeFernShield({ writer }: { writer: Writer }): void {
        const repoSource =
            this.readmeConfig.remote?.repoUrl ??
            `${this.organizationPascalCase}/${this.languageTitle}`;
        writer.writeLine(
            `[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=${encodeURIComponent(repoSource)})`
        );
    }

    private writeIntroudction({ writer }: { writer: Writer }): void {
        writer.writeLine(
            this.readmeConfig.introduction != null
                ? this.readmeConfig.introduction
                : `The ${this.organizationPascalCase} ${this.languageTitle} library provides convenient access to the ${this.organizationPascalCase} API from ${this.languageTitle}.`
        );
        writer.writeLine();
    }

    private generateDocumentation({ docsLink }: { docsLink: string }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Documentation");
        writer.writeLine();
        writer.writeLine(
            `API reference documentation is available [here](${docsLink}).`
        );
        writer.writeLine();
        return new Block({
            id: "DOCUMENTATION",
            content: writer.toString(),
        });
    }

    private generateReference({
        referenceFile,
    }: {
        referenceFile: string;
    }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Reference");
        writer.writeLine();
        writer.writeLine(
            `A full reference for this library is available [here](${referenceFile}).`
        );
        writer.writeLine();
        return new Block({
            id: "REFERENCE",
            content: writer.toString(),
        });
    }

    private generateRequirements({
        requirements,
    }: {
        requirements: string[];
    }): Block {
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

    private generateInstallation({
        language,
    }: {
        language: FernGeneratorCli.LanguageInfo;
    }): Block {
        if (language.publishInfo == null) {
            // This should be unreachable.
            throw new Error(
                "publish information is required for installation block"
            );
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

    private writeInstallationForNPM({
        writer,
        npm,
    }: {
        writer: Writer;
        npm: FernGeneratorCli.NpmPublishInfo;
    }): void {
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

    private writeInstallationForGo({
        writer,
        go,
    }: {
        writer: Writer;
        go: FernGeneratorCli.GoPublishInfo;
    }): void {
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

    private writeShield({
        writer,
        language,
    }: {
        writer: Writer;
        language: FernGeneratorCli.LanguageInfo;
    }): void {
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

    private writeShieldForNPM({
        writer,
        npm,
    }: {
        writer: Writer;
        npm: FernGeneratorCli.NpmPublishInfo;
    }): void {
        writer.write("[![npm shield]");
        writer.write(`(https://img.shields.io/npm/v/${npm.packageName})]`);
        writer.writeLine(`(https://www.npmjs.com/package/${npm.packageName})`);
    }

    private writeShieldForPyPi({
        writer,
        pypi,
    }: {
        writer: Writer;
        pypi: FernGeneratorCli.PypiPublishInfo;
    }): void {
        writer.write("[![pypi]");
        writer.write(`(https://img.shields.io/pypi/v/${pypi.packageName})]`);
        writer.writeLine(`(https://pypi.python.org/pypi/${pypi.packageName})`);
    }

    private writeShieldForMaven({
        writer,
        maven,
    }: {
        writer: Writer;
        maven: FernGeneratorCli.MavenPublishInfo;
    }): void {
        writer.write("[![Maven Central]");
        writer.write(
            `(https://img.shields.io/maven-central/v/${maven.artifact})]`
        );
        writer.writeLine(
            `(https://central.sonatype.com/artifact/${maven.group}/${maven.artifact})`
        );
    }

    private writeShieldForGo({
        writer,
        go,
    }: {
        writer: Writer;
        go: FernGeneratorCli.GoPublishInfo;
    }): void {
        writer.write("[![go shield]");
        writer.write("(https://img.shields.io/badge/go-docs-blue)]");
        writer.writeLine(
            `(https://pkg.go.dev/github.com/${go.owner}/${go.repo})`
        );
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

    private writeShieldForNuget({
        writer,
        nuget,
    }: {
        writer: Writer;
        nuget: FernGeneratorCli.NugetPublishInfo;
    }): void {
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

    private shouldSkipFeature({
        feature,
    }: {
        feature: FernGeneratorCli.ReadmeFeature;
    }): boolean {
        return (
            !feature.snippetsAreOptional &&
            (feature.snippets == null || feature.snippets.length === 0)
        );
    }

    private shouldGenerateFeatures({
        features,
    }: {
        features: FernGeneratorCli.ReadmeFeature[];
    }): boolean {
        return features.some((feature) => !this.shouldSkipFeature({ feature }));
    }
}

function languageToTitle(language: FernGeneratorCli.LanguageInfo): string {
    switch (language.type) {
        case "typescript":
            return "TypeScript";
        case "python":
            return "Python";
        case "go":
            return "Go";
        case "java":
            return "Java";
        case "ruby":
            return "Ruby";
        case "csharp":
            return "C#";
        default:
            assertNever(language);
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
