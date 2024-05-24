import { APIV1Read } from "@fern-api/fdr-sdk";
import { FernButton, FernCollapse, FernInput } from "@fern-ui/components";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { GlobeIcon, PersonIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback } from "react";
import { Key } from "react-feather";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth } from "./types";

interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    value: PlaygroundRequestFormAuth | undefined;
    onChange: (newAuthValue: PlaygroundRequestFormAuth) => void;
    disabled: boolean;
}

function BearerAuthForm({
    bearerAuth,
    value,
    onChange,
    disabled,
}: { bearerAuth: APIV1Read.BearerAuth } & Omit<PlaygroundAuthorizationFormProps, "auth">) {
    const handleChange = useCallback(
        (newValue: string) =>
            onChange({
                type: "bearerAuth",
                token: newValue,
            }),
        [onChange],
    );
    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            handleChange(secret.token);
        },
        [closeSecretsModal, handleChange],
    );

    return (
        <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
                <span className="font-mono text-sm">{bearerAuth.tokenName ?? "Bearer token"}</span>
            </label>

            <div>
                {value?.type === "bearerAuth" && (
                    <PasswordInputGroup
                        onValueChange={handleChange}
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
                        disabled={disabled}
                    />
                )}
            </div>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen && !disabled}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </li>
    );
}

function BasicAuthForm({
    basicAuth,
    value,
    onChange,
    disabled,
}: { basicAuth: APIV1Read.BasicAuth } & Omit<PlaygroundAuthorizationFormProps, "auth">) {
    const handleChangeUsername = useCallback(
        (newValue: string) =>
            onChange({
                type: "basicAuth",
                username: newValue,
                password: value?.type === "basicAuth" ? value.password : "",
            }),
        [onChange, value],
    );
    const handleChangePassword = useCallback(
        (newValue: string) =>
            onChange({
                type: "basicAuth",
                username: value?.type === "basicAuth" ? value.username : "",
                password: newValue,
            }),
        [onChange, value],
    );
    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            handleChangePassword(secret.token);
        },
        [closeSecretsModal, handleChangePassword],
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
                        value={value?.type === "basicAuth" ? value.username : ""}
                        leftIcon={<PersonIcon className="size-4" />}
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
                        value={value?.type === "basicAuth" ? value.password : ""}
                        rightElement={
                            <FernButton
                                onClick={openSecretsModal}
                                icon={<GlobeIcon className="size-4" />}
                                variant="minimal"
                            />
                        }
                        disabled={disabled}
                    />
                </div>
            </li>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen && !disabled}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </>
    );
}

function HeaderAuthForm({
    header,
    value,
    onChange,
    disabled,
}: { header: APIV1Read.HeaderAuth } & Omit<PlaygroundAuthorizationFormProps, "auth">) {
    const handleChange = useCallback(
        (newValue: string) =>
            onChange({
                type: "header",
                headers: { [header.headerWireValue]: newValue },
            }),
        [header.headerWireValue, onChange],
    );
    const {
        value: isSecretsModalOpen,
        setTrue: openSecretsModal,
        setFalse: closeSecretsModal,
    } = useBooleanState(false);

    const handleSelectSecret = useCallback(
        (secret: SecretBearer) => {
            closeSecretsModal();
            handleChange(secret.token);
        },
        [closeSecretsModal, handleChange],
    );

    return (
        <li className="-mx-4 space-y-2 p-4">
            <label className="inline-flex flex-wrap items-baseline">
                <span className="font-mono text-sm">{header.nameOverride ?? header.headerWireValue}</span>
            </label>
            <div>
                <PasswordInputGroup
                    onValueChange={handleChange}
                    value={value?.type === "header" ? value.headers[header.headerWireValue] : ""}
                    autoComplete="off"
                    data-1p-ignore="true"
                    rightElement={
                        <FernButton
                            onClick={openSecretsModal}
                            icon={<GlobeIcon className="size-4" />}
                            variant="minimal"
                        />
                    }
                    disabled={disabled}
                />
            </div>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen && !disabled}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </li>
    );
}

export const PlaygroundAuthorizationForm: FC<PlaygroundAuthorizationFormProps> = ({
    auth,
    value,
    onChange,
    disabled,
}) => {
    return (
        <ul className="list-none px-4">
            {visitDiscriminatedUnion(auth, "type")._visit({
                bearerAuth: (bearerAuth) => (
                    <BearerAuthForm bearerAuth={bearerAuth} value={value} onChange={onChange} disabled={disabled} />
                ),
                basicAuth: (basicAuth) => (
                    <BasicAuthForm basicAuth={basicAuth} value={value} onChange={onChange} disabled={disabled} />
                ),
                header: (header) => (
                    <HeaderAuthForm header={header} value={value} onChange={onChange} disabled={disabled} />
                ),
                _other: () => null,
            })}
        </ul>
    );
};

interface PlaygroundAuthorizationFormCardProps {
    auth: APIV1Read.ApiAuth;
    authState: PlaygroundRequestFormAuth | undefined;
    setAuthorization: Dispatch<SetStateAction<PlaygroundRequestFormAuth | undefined>>;
    disabled: boolean;
}

export function PlaygroundAuthorizationFormCard({
    auth,
    authState,
    setAuthorization,
    disabled,
}: PlaygroundAuthorizationFormCardProps): ReactElement | null {
    const isOpen = useBooleanState(false);

    return (
        <div>
            {isAuthed(auth, authState) ? (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="success"
                    variant="outlined"
                    text="Authenticate with your API key to send a real request"
                    icon={<Key />}
                    rightIcon={
                        <span className="flex items-center rounded-[4px] bg-tag-success p-1 font-mono text-xs uppercase leading-none text-intent-success">
                            Connect
                        </span>
                    }
                    onClick={isOpen.toggleValue}
                    active={isOpen.value}
                />
            ) : (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="danger"
                    variant="outlined"
                    text="Authenticate with your API key to send a real request"
                    icon={<Key />}
                    rightIcon={
                        <span className="flex items-center rounded-[4px] bg-tag-danger p-1 font-mono text-xs uppercase leading-none text-intent-danger">
                            Connect
                        </span>
                    }
                    onClick={isOpen.toggleValue}
                    active={isOpen.value}
                />
            )}
            <FernCollapse isOpen={isOpen.value}>
                <div className="pt-4">
                    <div className="fern-dropdown">
                        <PlaygroundAuthorizationForm
                            auth={auth}
                            value={authState}
                            onChange={setAuthorization}
                            disabled={disabled}
                        />
                        <div className="flex justify-end p-4 pt-2">
                            <FernButton text="Done" intent="primary" onClick={isOpen.setFalse} />
                        </div>
                    </div>
                </div>
            </FernCollapse>
        </div>
    );
}

function isAuthed(auth: APIV1Read.ApiAuth, authState: PlaygroundRequestFormAuth | undefined): boolean {
    if (authState == null) {
        return false;
    }

    return visitDiscriminatedUnion(auth, "type")._visit({
        bearerAuth: () => authState.type === "bearerAuth" && !isEmpty(authState.token.trim()),
        basicAuth: () =>
            authState.type === "basicAuth" &&
            !isEmpty(authState.username.trim()) &&
            !isEmpty(authState.password.trim()),
        header: (header) => authState.type === "header" && !isEmpty(authState.headers[header.headerWireValue]?.trim()),
        _other: () => false,
    });
}
