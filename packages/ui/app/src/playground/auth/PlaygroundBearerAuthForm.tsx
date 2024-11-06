import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { useAtom } from "jotai/react";
import { ReactElement, useCallback } from "react";
import { PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM } from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";

export function PlaygroundBearerAuthForm({
    bearerAuth,
    disabled,
}: {
    bearerAuth: APIV1Read.BearerAuth;
    disabled?: boolean;
}): ReactElement {
    const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
    const handleChange = useCallback((newValue: string) => setValue({ token: newValue }), [setValue]);

    return (
        <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
                <span className="font-mono text-sm">{bearerAuth.tokenName ?? "Bearer token"}</span>
            </label>

            <div>
                <PasswordInputGroup
                    onValueChange={handleChange}
                    value={value.token}
                    autoComplete="off"
                    data-1p-ignore="true"
                    disabled={disabled}
                />
            </div>
        </li>
    );
}
