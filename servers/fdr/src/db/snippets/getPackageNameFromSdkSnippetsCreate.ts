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
