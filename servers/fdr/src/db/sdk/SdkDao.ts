import { APIV1Write } from "@fern-api/fdr-sdk";
import { Language, PrismaClient } from "@prisma/client";
import { SdkIdFactory } from "../snippets/SdkIdFactory";
import { SdkId } from "../types";

export interface SdkIdForPackage {
    typescriptSdk?: APIV1Write.TypescriptPackage & { sdkId: string };
    pythonSdk?: APIV1Write.PythonPackage & { sdkId: string };
    goSdk?: APIV1Write.GoModule & { sdkId: string };
    rubySdk?: APIV1Write.RubyGem & { sdkId: string };
    javaSdk?: APIV1Write.JavaCoordinate & { sdkId: string };
}

export interface SdkDao {
    getSdkIdsForPackages(snippetConfig: APIV1Write.SnippetsConfig): Promise<SdkIdForPackage>;

    getSdkIdForPackage({
        sdkPackage,
        language,
    }: {
        sdkPackage: string;
        language: Language;
    }): Promise<SdkId | undefined>;
}

export class SdkDaoImpl implements SdkDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async getSdkIdsForPackages(snippetConfig: APIV1Write.SnippetsConfig): Promise<SdkIdForPackage> {
        const result: SdkIdForPackage = {};
        if (snippetConfig.typescriptSdk != null) {
            const sdkId = await this.getSdkIdForPackage({
                sdkPackage: snippetConfig.typescriptSdk.package,
                language: Language.TYPESCRIPT,
            });
            if (sdkId != null) {
                result.typescriptSdk = { ...snippetConfig.typescriptSdk, sdkId };
            }
        }
        if (snippetConfig.pythonSdk != null) {
            const sdkId = await this.getSdkIdForPackage({
                sdkPackage: snippetConfig.pythonSdk.package,
                language: Language.PYTHON,
            });
            if (sdkId != null) {
                result.pythonSdk = { ...snippetConfig.pythonSdk, sdkId };
            }
        }
        if (snippetConfig.javaSdk != null) {
            const sdkId = await this.getSdkIdForPackage({
                sdkPackage: snippetConfig.javaSdk.coordinate,
                language: Language.JAVA,
            });
            if (sdkId != null) {
                result.javaSdk = { ...snippetConfig.javaSdk, sdkId };
            }
        }
        if (snippetConfig.goSdk != null) {
            const sdkId = await this.getSdkIdForPackage({
                sdkPackage: snippetConfig.goSdk.githubRepo,
                language: Language.GO,
            });
            if (sdkId != null) {
                result.goSdk = { ...snippetConfig.goSdk, sdkId };
            }
        }

        return result;
    }

    public async getSdkIdForPackage({
        sdkPackage,
        language,
        version,
    }: {
        sdkPackage: string;
        language: Language;
        version?: string;
    }): Promise<string | undefined> {
        let id: string | undefined;
        if (version != null) {
            switch (language) {
                case Language.TYPESCRIPT:
                    id = SdkIdFactory.fromTypescript({ package: sdkPackage, version });
                    break;
                case Language.PYTHON:
                    id = SdkIdFactory.fromPython({ package: sdkPackage, version });
                    break;
                case Language.GO:
                    id = SdkIdFactory.fromGo({ githubRepo: sdkPackage, version });
                    break;
                case Language.RUBY:
                    id = SdkIdFactory.fromRuby({ gem: sdkPackage, version });
                    break;
                case Language.JAVA: {
                    // TODO(armandobelardo): confirm how to do java here
                    const splitCoord = sdkPackage.split(":");
                    if (splitCoord.length === 2) {
                        const group = sdkPackage.split(":")[0];
                        const artifact = sdkPackage.split(":")[1];
                        id = SdkIdFactory.fromJava({ group, artifact, version });
                    }
                    break;
                }
                default:
                    break;
            }
            if (id != null) {
                return id;
            }
        }

        const sdkRow = await this.prisma.sdk.findFirst({
            select: {
                id: true,
            },
            where: {
                package: sdkPackage,
                language,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return sdkRow?.id;
    }
}
