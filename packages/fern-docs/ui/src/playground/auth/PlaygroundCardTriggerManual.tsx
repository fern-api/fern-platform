import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernButton } from "@fern-docs/components";
import { Key } from "iconoir-react";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { PLAYGROUND_AUTH_STATE_ATOM } from "../../atoms";
import { PlaygroundAuthState } from "../types";
import { pascalCaseHeaderKey } from "../utils/header-key-case";

interface PlaygroundCardTriggerManualProps {
    auth: APIV1Read.ApiAuth;
    disabled: boolean;
    toggleOpen: () => void;
    isOpen: boolean;
}

export function PlaygroundCardTriggerManual({
    auth,
    disabled,
    toggleOpen,
    isOpen,
}: PlaygroundCardTriggerManualProps): ReactElement | false {
    const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);

    const authButtonCopy = "Login to send a real request";

    if (isAuthed(auth, authState)) {
        return (
            <FernButton
                className="w-full text-left"
                size="large"
                intent="success"
                variant="outlined"
                text={authButtonCopy}
                icon={<Key />}
                rightIcon={
                    <span className="flex items-center rounded-[4px] bg-tag-success p-1 font-mono text-xs uppercase leading-none text-intent-success">
                        Authenticated
                    </span>
                }
                onClick={toggleOpen}
                active={isOpen}
                disabled={disabled}
            />
        );
    } else {
        return (
            <FernButton
                className="w-full text-left"
                size="large"
                intent="danger"
                variant="outlined"
                text={authButtonCopy}
                icon={<Key />}
                rightIcon={
                    <span className="flex items-center rounded-[4px] bg-tag-danger p-1 font-mono text-xs uppercase leading-none text-intent-danger">
                        Not Authenticated
                    </span>
                }
                onClick={toggleOpen}
                active={isOpen}
                disabled={disabled}
            />
        );
    }
}

function isEmpty(str: string | undefined): boolean {
    return str == null || str.trim().length === 0;
}

function isAuthed(
    auth: APIV1Read.ApiAuth,
    authState: PlaygroundAuthState
): boolean {
    return visitDiscriminatedUnion(auth)._visit({
        bearerAuth: () => !isEmpty(authState.bearerAuth?.token.trim()),
        basicAuth: () =>
            !isEmpty(authState.basicAuth?.username.trim()) &&
            !isEmpty(authState.basicAuth?.password.trim()),
        header: (header) =>
            !isEmpty(
                authState.header?.headers[
                    pascalCaseHeaderKey(header.headerWireValue)
                ]?.trim()
            ),
        oAuth: () => {
            const authToken =
                authState.oauth?.selectedInputMethod === "credentials"
                    ? authState.oauth?.accessToken
                    : authState.oauth?.userSuppliedAccessToken;
            return authToken ? !isEmpty(authToken.trim()) : false;
        },
        _other: () => false,
    });
}
