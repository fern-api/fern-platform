import { FdrAPI } from "../../api";
import { assertNever } from "../../util";

export function getPackageNameFromSdkSnippetsCreate(create: FdrAPI.SdkSnippetsCreate): string {
    switch (create.type) {
        case "go":
            return create.sdk.githubRepo;
        case "java":
            return `${create.sdk.group}:${create.sdk.artifact}`;
        case "python":
            return create.sdk.package;
        case "typescript":
            return create.sdk.package;
        case "ruby":
            return create.sdk.gem;
        default:
            assertNever(create);
    }
}

export function getPackageNameFromSdk(sdk: FdrAPI.SdkRequest): string {
    switch (sdk.type) {
        case "go":
            return sdk.githubRepo;
        case "java":
            return `${sdk.group}:${sdk.artifact}`;
        case "python":
            return sdk.package;
        case "typescript":
            return sdk.package;
        case "ruby":
            return sdk.gem;
        default:
            assertNever(sdk);
    }
}
