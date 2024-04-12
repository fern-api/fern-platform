import { APIV1Write } from "@fern-api/fdr-sdk";
import { Language, PrismaClient } from "@prisma/client";
import { SdkId } from "../types";

export interface SdkIdForPackage {
    typescriptSdk?: APIV1Write.TypescriptPackage & { sdkId: string };
    pythonSdk?: APIV1Write.PythonPackage & { sdkId: string };
    goSdk?: APIV1Write.GoModule & { sdkId: string };
    rubySdk?: APIV1Write.RubyGem & { sdkId: string };
    javaSdk?: APIV1Write.JavaCoordinate & { sdkId: string };
}

export interface SdkDao {
    getLatestSdkIdsForPackages(snippetConfig: APIV1Write.SnippetsConfig): Promise<SdkIdForPackage>;

    getLatestSdkIdForPackage({
        sdkPackage,
        language,
    }: {
        sdkPackage: string;
        language: Language;
    }): Promise<SdkId | undefined>;
}

export class SdkDaoImpl implements SdkDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async getLatestSdkIdsForPackages(snippetConfig: APIV1Write.SnippetsConfig): Promise<SdkIdForPackage> {
        const result: SdkIdForPackage = {};
        if (snippetConfig.typescriptSdk != null) {
            const sdkId = await this.getLatestSdkIdForPackage({
                sdkPackage: snippetConfig.typescriptSdk.package,
                language: Language.TYPESCRIPT,
            });
            if (sdkId != null) {
                result.typescriptSdk = { ...snippetConfig.typescriptSdk, sdkId };
            }
        }
        if (snippetConfig.pythonSdk != null) {
            const sdkId = await this.getLatestSdkIdForPackage({
                sdkPackage: snippetConfig.pythonSdk.package,
                language: Language.PYTHON,
            });
            if (sdkId != null) {
                result.pythonSdk = { ...snippetConfig.pythonSdk, sdkId };
            }
        }
        if (snippetConfig.javaSdk != null) {
            const sdkId = await this.getLatestSdkIdForPackage({
                sdkPackage: snippetConfig.javaSdk.coordinate,
                language: Language.JAVA,
            });
            if (sdkId != null) {
                result.javaSdk = { ...snippetConfig.javaSdk, sdkId };
            }
        }
        if (snippetConfig.goSdk != null) {
            const sdkId = await this.getLatestSdkIdForPackage({
                sdkPackage: snippetConfig.goSdk.githubRepo,
                language: Language.GO,
            });
            if (sdkId != null) {
                result.goSdk = { ...snippetConfig.goSdk, sdkId };
            }
        }

        return result;
    }

    public async getLatestSdkIdForPackage({
        sdkPackage,
        language,
    }: {
        sdkPackage: string;
        language: Language;
    }): Promise<string | undefined> {
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
