import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernInput } from "@fern-ui/components";
import { Undo, User } from "iconoir-react";
import { useAtom, useAtomValue } from "jotai/react";
import { RESET } from "jotai/utils";
import { ReactElement } from "react";
import {
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_PASSWORD_ATOM,
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_PASSWORD_IS_RESETTABLE_ATOM,
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_USERNAME_ATOM,
    PLAYGROUND_AUTH_STATE_BASIC_AUTH_USERNAME_IS_RESETTABLE_ATOM,
} from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";

export function PlaygroundBasicAuthForm({
    basicAuth,
    disabled,
}: {
    basicAuth: APIV1Read.BasicAuth;
    disabled?: boolean;
}): ReactElement {
    const [username, setUsername] = useAtom(PLAYGROUND_AUTH_STATE_BASIC_AUTH_USERNAME_ATOM);
    const [password, setPassword] = useAtom(PLAYGROUND_AUTH_STATE_BASIC_AUTH_PASSWORD_ATOM);
    const isUsernameResettable = useAtomValue(PLAYGROUND_AUTH_STATE_BASIC_AUTH_USERNAME_IS_RESETTABLE_ATOM);
    const isPasswordResettable = useAtomValue(PLAYGROUND_AUTH_STATE_BASIC_AUTH_PASSWORD_IS_RESETTABLE_ATOM);
    return (
        <>
            <li className="-mx-4 space-y-2 p-4">
                <label className="inline-flex flex-wrap items-baseline">
                    <span className="font-mono text-sm">{basicAuth.usernameName ?? "Username"}</span>
                </label>
                <div>
                    <FernInput
                        onValueChange={setUsername}
                        value={username}
                        leftIcon={<User className="size-icon" />}
                        rightElement={
                            isUsernameResettable ? (
                                <FernButton icon={<Undo />} variant="minimal" onClick={() => setUsername(RESET)} />
                            ) : (
                                <span className="t-muted text-xs">{"string"}</span>
                            )
                        }
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
                        onValueChange={setPassword}
                        value={password}
                        disabled={disabled}
                        rightElement={
                            isPasswordResettable ? (
                                <FernButton icon={<Undo />} variant="minimal" onClick={() => setPassword(RESET)} />
                            ) : undefined
                        }
                    />
                </div>
            </li>
        </>
    );
}
