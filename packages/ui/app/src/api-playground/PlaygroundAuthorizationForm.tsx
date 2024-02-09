import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedEndpointDefinition } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { Cross1Icon, GlobeIcon, PersonIcon } from "@radix-ui/react-icons";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback } from "react";
import { FernButton } from "../components/FernButton";
import { FernCard } from "../components/FernCard";
import { FernInput } from "../components/FernInput";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { SecretBearer, SecretSpan } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";

interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    value: PlaygroundRequestFormAuth | undefined;
    onChange: (newAuthValue: PlaygroundRequestFormAuth) => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
}

export const PlaygroundAuthorizationForm: FC<PlaygroundAuthorizationFormProps> = ({
    auth,
    value,
    onChange,
    secrets,
    openSecretsModal,
}) => {
    return (
        <ul className="divide-border-default list-none divide-y px-4">
            {visitDiscriminatedUnion(auth, "type")._visit({
                bearerAuth: (bearerAuth) => (
                    <li className="-mx-4 space-y-2 p-4">
                        <label className="inline-flex flex-wrap items-baseline">
                            <span className="font-mono text-sm">{bearerAuth.tokenName ?? "Bearer token"}</span>
                        </label>

                        <div>
                            {value?.type === "bearerAuth" &&
                            secrets.some((secret) => value?.type === "bearerAuth" && value.token === secret.token) ? (
                                <span className="inline-flex items-center gap-1">
                                    <SecretSpan secret={value.token} className="text-sm" />
                                    <FernButton
                                        icon={<Cross1Icon className="size-4" />}
                                        variant="minimal"
                                        size="small"
                                        onClick={() => {
                                            onChange({
                                                type: "bearerAuth",
                                                token: "",
                                            });
                                        }}
                                        className="-mr-2"
                                    />
                                </span>
                            ) : (
                                <PasswordInputGroup
                                    onValueChange={(newValue) =>
                                        onChange({
                                            type: "bearerAuth",
                                            token: newValue,
                                        })
                                    }
                                    value={value?.type === "bearerAuth" ? value.token : ""}
                                    autoComplete="off"
                                    data-1p-ignore="true"
                                    rightElement={
                                        <FernButton
                                            onClick={openSecretsModal}
                                            icon={<GlobeIcon className="size-4" />}
                                            variant="minimal"
                                        />
                                    }
                                />
                            )}
                        </div>
                    </li>
                ),
                basicAuth: (basicAuth) => (
                    <>
                        <li className="-mx-4 space-y-2 p-4">
                            <label className="inline-flex flex-wrap items-baseline">
                                <span className="font-mono text-sm">{basicAuth.usernameName ?? "Username"}</span>
                            </label>
                            <div>
                                <FernInput
                                    onValueChange={(newValue) =>
                                        onChange({
                                            type: "basicAuth",
                                            username: newValue,
                                            password: value?.type === "basicAuth" ? value.password : "",
                                        })
                                    }
                                    value={value?.type === "basicAuth" ? value.username : ""}
                                    leftIcon={<PersonIcon className="size-4" />}
                                    rightElement={<span className="t-muted text-xs">{"string"}</span>}
                                />
                            </div>
                        </li>

                        <li className="-mx-4 space-y-2 p-4">
                            <label className="inline-flex flex-wrap items-baseline">
                                <span className="font-mono text-sm">{basicAuth.passwordName ?? "Password"}</span>
                            </label>

                            <div>
                                <PasswordInputGroup
                                    onValueChange={(newValue) =>
                                        onChange({
                                            type: "basicAuth",
                                            username: value?.type === "basicAuth" ? value.username : "",
                                            password: newValue,
                                        })
                                    }
                                    value={value?.type === "basicAuth" ? value.password : ""}
                                />
                            </div>
                        </li>
                    </>
                ),
                header: (header) => (
                    <li className="-mx-4 space-y-2 p-4">
                        <label className="inline-flex flex-wrap items-baseline">
                            <span className="font-mono text-sm">{header.nameOverride ?? header.headerWireValue}</span>
                        </label>
                        <div>
                            <PasswordInputGroup
                                onValueChange={(newValue) =>
                                    onChange({
                                        type: "header",
                                        headers: { [header.headerWireValue]: newValue },
                                    })
                                }
                                value={value?.type === "header" ? value.headers[header.headerWireValue] : ""}
                                autoComplete="off"
                                data-1p-ignore="true"
                            />
                        </div>
                    </li>
                ),
                _other: () => null,
            })}
        </ul>
    );
};

interface PlaygroundAuthorizationFormCardProps {
    endpoint: ResolvedEndpointDefinition;
    auth: APIV1Read.ApiAuth | undefined;
    formState: PlaygroundRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
}

export function PlaygroundAuthorizationFormCard({
    endpoint,
    auth,
    formState,
    setFormState,
    openSecretsModal,
    secrets,
}: PlaygroundAuthorizationFormCardProps): ReactElement | null {
    const setAuthorization = useCallback(
        (newAuthValue: PlaygroundRequestFormAuth) => {
            setFormState((state) => ({
                ...state,
                auth: newAuthValue,
            }));
        },
        [setFormState],
    );

    if (!endpoint.authed || auth == null) {
        return null;
    }
    return (
        <FernCard className="border-border-danger-soft divide-border-default divide-y rounded-xl shadow-sm">
            <PlaygroundAuthorizationForm
                auth={auth}
                value={formState?.auth}
                onChange={setAuthorization}
                openSecretsModal={openSecretsModal}
                secrets={secrets}
            />
        </FernCard>
    );
}
