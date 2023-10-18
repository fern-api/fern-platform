import { assertNever } from "../../util";
import { FdrAPI } from "../../api";

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
        default:
            assertNever(create);
    }
}
