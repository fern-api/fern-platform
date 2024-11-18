import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { unknownToString } from "@fern-api/ui-core-utils";
import { atom } from "jotai";
import { useAtom } from "jotai/react";
import type { ReactElement, SetStateAction } from "react";
import { useMemoOne } from "use-memo-one";
import { PLAYGROUND_AUTH_STATE_HEADER_ATOM } from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";
import { pascalCaseHeaderKey } from "../utils/header-key-case";

export function PlaygroundHeaderAuthForm({
    header,
    disabled,
}: {
    header: APIV1Read.HeaderAuth;
    disabled?: boolean;
}): ReactElement {
    const [value, setValue] = useAtom(
        useMemoOne(
            () =>
                atom(
                    (get) =>
                        get(PLAYGROUND_AUTH_STATE_HEADER_ATOM).headers[pascalCaseHeaderKey(header.headerWireValue)],
                    (_get, set, change: SetStateAction<string>) => {
                        set(PLAYGROUND_AUTH_STATE_HEADER_ATOM, ({ headers }) => ({
                            headers: {
                                ...headers,
                                [pascalCaseHeaderKey(header.headerWireValue)]:
                                    typeof change === "function"
                                        ? change(headers[pascalCaseHeaderKey(header.headerWireValue)] ?? "")
                                        : change,
                            },
                        }));
                    },
                ),
            [header.headerWireValue],
        ),
    );

    return (
        <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
                <span className="font-mono text-sm">
                    {header.nameOverride ?? pascalCaseHeaderKey(header.headerWireValue)}
                </span>
            </label>
            <div>
                <PasswordInputGroup
                    onValueChange={setValue}
                    value={unknownToString(value ?? "")}
                    autoComplete="off"
                    data-1p-ignore="true"
                    disabled={disabled}
                />
            </div>
        </li>
    );
}
