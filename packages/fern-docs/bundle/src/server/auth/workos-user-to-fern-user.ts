import { FernUser } from "@fern-docs/auth";
import { compact } from "es-toolkit/array";
import { NoWorkOSUserInfo, WorkOSUserInfo } from "./interfaces";

export function toFernUser(
    { user }: WorkOSUserInfo | NoWorkOSUserInfo,
    roles?: string[]
): FernUser {
    return {
        email: user?.email,
        name:
            compact([user?.firstName, user?.lastName]).join(" ") ||
            user?.email?.split("@")[0],
        roles,
    };
}
