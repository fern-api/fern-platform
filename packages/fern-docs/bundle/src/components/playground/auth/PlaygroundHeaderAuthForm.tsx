import type { ReactElement, SetStateAction } from "react";

import { atom } from "jotai";
import { useAtom, useAtomValue } from "jotai/react";
import { RESET } from "jotai/utils";
import { useMemoOne } from "use-memo-one";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { unknownToString } from "@fern-api/ui-core-utils";

import { FERN_USER_ATOM, PLAYGROUND_AUTH_STATE_HEADER_ATOM } from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";
import { pascalCaseHeaderKey } from "../utils/header-key-case";

function headerAtom(headerName: string) {
  return atom(
    (get) =>
      get(PLAYGROUND_AUTH_STATE_HEADER_ATOM).headers[
        pascalCaseHeaderKey(headerName)
      ],
    (_get, set, change: SetStateAction<string> | typeof RESET) => {
      set(PLAYGROUND_AUTH_STATE_HEADER_ATOM, ({ headers }) => {
        const nextHeaderValue =
          typeof change === "function"
            ? change(headers[pascalCaseHeaderKey(headerName)] ?? "")
            : change;
        if (nextHeaderValue === RESET) {
          return {
            // note: this will remove all undefined values from the object
            headers: JSON.parse(
              JSON.stringify({
                ...headers,
                [pascalCaseHeaderKey(headerName)]: undefined,
              })
            ),
          };
        }
        return {
          headers: {
            ...headers,
            [pascalCaseHeaderKey(headerName)]: nextHeaderValue,
          },
        };
      });
    }
  );
}

function isHeaderResettableAtom(headerName: string) {
  return atom((get) => {
    const inputHeader = get(PLAYGROUND_AUTH_STATE_HEADER_ATOM).headers[
      pascalCaseHeaderKey(headerName)
    ];
    const injectedHeader =
      get(FERN_USER_ATOM)?.playground?.initial_state?.headers?.[
        pascalCaseHeaderKey(headerName)
      ];
    return injectedHeader != null && injectedHeader !== inputHeader;
  });
}

export function PlaygroundHeaderAuthForm({
  header,
  disabled,
}: {
  header: APIV1Read.HeaderAuth;
  disabled?: boolean;
}): ReactElement<any> {
  const [value, setValue] = useAtom(
    useMemoOne(
      () => headerAtom(header.headerWireValue),
      [header.headerWireValue]
    )
  );
  const isResettable = useAtomValue(
    useMemoOne(
      () => isHeaderResettableAtom(header.headerWireValue),
      [header.headerWireValue]
    )
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
          resettable={isResettable}
          onClickReset={() => setValue(RESET)}
        />
      </div>
    </li>
  );
}
