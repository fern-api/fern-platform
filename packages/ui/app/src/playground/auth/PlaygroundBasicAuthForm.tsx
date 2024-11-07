import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernInput } from "@fern-ui/components";
import { User } from "iconoir-react";
import { useAtom } from "jotai/react";
import { ReactElement, useCallback } from "react";
import { PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM } from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";

export function PlaygroundBasicAuthForm({
    basicAuth,
    disabled,
}: {
    basicAuth: APIV1Read.BasicAuth;
    disabled?: boolean;
}): ReactElement {
    const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM);
    const handleChangeUsername = useCallback(
        (newValue: string) => setValue((prev) => ({ ...prev, username: newValue })),
        [setValue],
    );
    const handleChangePassword = useCallback(
        (newValue: string) => setValue((prev) => ({ ...prev, password: newValue })),
        [setValue],
    );
    return (
        <>
            <li className="-mx-4 space-y-2 p-4">
                <label className="inline-flex flex-wrap items-baseline">
                    <span className="font-mono text-sm">{basicAuth.usernameName ?? "Username"}</span>
                </label>
                <div>
                    <FernInput
                        onValueChange={handleChangeUsername}
                        value={value.username}
                        leftIcon={<User className="size-icon" />}
                        rightElement={<span className="t-muted text-xs">{"string"}</span>}
                        disabled={disabled}
                    />
                </div>
            </li>

            <li className="-mx-4 space-y-2 p-4">
                <label className="inline-flex flex-wrap items-baseline">
                    <span className="font-mono text-sm">{basicAuth.passwordName ?? "Password"}</span>
                </label>

                <div>
                    <PasswordInputGroup
                        onValueChange={handleChangePassword}
                        value={value.password}
                        disabled={disabled}
                    />
                </div>
            </li>
        </>
    );
}
