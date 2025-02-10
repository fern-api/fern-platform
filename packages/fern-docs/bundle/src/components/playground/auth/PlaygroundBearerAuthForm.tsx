import { ReactElement } from "react";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { useAtom, useAtomValue } from "jotai/react";
import { RESET } from "jotai/utils";

import {
  PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
  PLAYGROUND_AUTH_STATE_BEARER_TOKEN_IS_RESETTABLE_ATOM,
} from "../../atoms";
import { PasswordInputGroup } from "../PasswordInputGroup";

export function PlaygroundBearerAuthForm({
  bearerAuth,
  disabled,
}: {
  bearerAuth: APIV1Read.BearerAuth;
  disabled?: boolean;
}): ReactElement<any> {
  const [value, setValue] = useAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
  const isBearerTokenResettable = useAtomValue(
    PLAYGROUND_AUTH_STATE_BEARER_TOKEN_IS_RESETTABLE_ATOM
  );

  return (
    <li className="-mx-4 space-y-2 p-4">
      <label className="inline-flex flex-wrap items-baseline">
        <span className="font-mono text-sm">
          {bearerAuth.tokenName ?? "Bearer token"}
        </span>
      </label>

      <div>
        <PasswordInputGroup
          onValueChange={(newValue) => setValue({ token: newValue })}
          value={value.token}
          autoComplete="off"
          data-1p-ignore="true"
          disabled={disabled}
          resettable={isBearerTokenResettable}
          onClickReset={() => setValue(RESET)}
        />
      </div>
    </li>
  );
}
