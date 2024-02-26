import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { GlobeIcon, PersonIcon } from "@radix-ui/react-icons";
import { isEmpty } from "lodash-es";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback } from "react";
import { Key } from "react-feather";
import { FernButton } from "../components/FernButton";
import { FernCollapse } from "../components/FernCollapse";
import { FernInput } from "../components/FernInput";
import { ResolvedEndpointDefinition } from "../util/resolver";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";

interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    value: PlaygroundRequestFormAuth | undefined;
    onChange: (newAuthValue: PlaygroundRequestFormAuth) => void;
}

function BearerAuthForm({
    bearerAuth,
    value,
    onChange,
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
                    />
                )}
            </div>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen}
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
                    />
                </div>
            </li>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen}
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
                />
            </div>

            <PlaygroundSecretsModal
                isOpen={isSecretsModalOpen}
                onClose={closeSecretsModal}
                selectSecret={handleSelectSecret}
            />
        </li>
    );
}

export const PlaygroundAuthorizationForm: FC<PlaygroundAuthorizationFormProps> = ({ auth, value, onChange }) => {
    return (
        <ul className="list-none px-4">
            {visitDiscriminatedUnion(auth, "type")._visit({
                bearerAuth: (bearerAuth) => (
                    <BearerAuthForm bearerAuth={bearerAuth} value={value} onChange={onChange} />
                ),
                basicAuth: (basicAuth) => <BasicAuthForm basicAuth={basicAuth} value={value} onChange={onChange} />,
                header: (header) => <HeaderAuthForm header={header} value={value} onChange={onChange} />,
                _other: () => null,
            })}
        </ul>
    );
};

interface PlaygroundAuthorizationFormCardProps {
    endpoint: ResolvedEndpointDefinition;
    auth: APIV1Read.ApiAuth | null | undefined;
    formState: PlaygroundRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
}

export function PlaygroundAuthorizationFormCard({
    endpoint,
    auth,
    formState,
    setFormState,
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

    const isOpen = useBooleanState(false);

    if (!endpoint.authed || auth == null) {
        return null;
    }

    return (
        <div>
            {isAuthed(auth, formState?.auth) ? (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="success"
                    variant="outlined"
                    text="Authenticate with your API key to send a real request"
                    icon={<Key />}
                    rightIcon={
                        <span className="bg-tag-success text-intent-success flex items-center rounded-[4px] p-1 font-mono text-xs uppercase leading-none">
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
                        <span className="bg-tag-danger text-intent-danger flex items-center rounded-[4px] p-1 font-mono text-xs uppercase leading-none">
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
                        <PlaygroundAuthorizationForm auth={auth} value={formState?.auth} onChange={setAuthorization} />
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
