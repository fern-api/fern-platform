import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { atom } from "jotai";
import { useAtom } from "jotai/react";
import type { ReactElement, SetStateAction } from "react";
import { useMemoOne } from "use-memo-one";
import { PLAYGROUND_AUTH_STATE_HEADER_ATOM } from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";

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
                    (get) => get(PLAYGROUND_AUTH_STATE_HEADER_ATOM).headers[header.headerWireValue],
                    (_get, set, change: SetStateAction<string>) => {
                        set(PLAYGROUND_AUTH_STATE_HEADER_ATOM, ({ headers }) => ({
                            headers: {
                                ...headers,
                                [header.headerWireValue]:
                                    typeof change === "function"
                                        ? change(headers[header.headerWireValue] ?? "")
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
                <span className="font-mono text-sm">{header.nameOverride ?? header.headerWireValue}</span>
            </label>
            <div>
                <PasswordInputGroup
                    onValueChange={setValue}
                    value={value}
                    autoComplete="off"
                    data-1p-ignore="true"
                    disabled={disabled}
                />
            </div>
        </li>
    );
}
