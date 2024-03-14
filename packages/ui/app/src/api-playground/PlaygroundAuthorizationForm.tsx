import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { GlobeIcon, PersonIcon } from "@radix-ui/react-icons";
import { atom, useSetAtom } from "jotai";
import { isEmpty } from "lodash-es";
import { FC, ReactElement, useCallback, useState } from "react";
import { Key } from "react-feather";
import { FernButton } from "../components/FernButton";
import { FernCollapse } from "../components/FernCollapse";
import { FernInput } from "../components/FernInput";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundSecretsModal, SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormAuth } from "./types";
interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    value: PlaygroundRequestFormAuth | undefined;
    onChange: (newAuthValue: PlaygroundRequestFormAuth) => void;
    disabled: boolean;
}

function getPublicKey() {
    const publicKey = process.env.NEXT_PUBLIC_API_PLAYGROUND_PUBLIC_KEY;
    if (!publicKey) {
        throw new Error("NEXT_PUBLIC_API_PLAYGROUND_PUBLIC_KEY is not set");
    }
    return publicKey;
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
    disabled: boolean;
}

const AUTH_TEXT = "Securely authenticate with your API key to send a real request";
const SECURITY_HELPER = "API keys are encrypted and stored securely in your browser";

export interface PlaygroundRequestFormAuthValue {
    bearerAuth?: PlaygroundRequestFormAuth.BearerAuth;
    header?: PlaygroundRequestFormAuth.Header;
    basicAuth?: PlaygroundRequestFormAuth.BasicAuth;
}

export const ENCRYPTED_AUTHORIZATION_FORM = atom<PlaygroundRequestFormAuthValue>({});

export function PlaygroundAuthorizationFormCard({
    auth,
    disabled,
}: PlaygroundAuthorizationFormCardProps): ReactElement | null {
    const { value: isOpen, setFalse: close, toggleValue: toggleOpen } = useBooleanState(false);

    const setEncryptedAuthorization = useSetAtom(ENCRYPTED_AUTHORIZATION_FORM);

    const [unencryptedAuthorization, setUnencryptedAuthorization] = useState<PlaygroundRequestFormAuth | undefined>(
        undefined,
    );

    const encryptAndClose = useCallback(async () => {
        if (unencryptedAuthorization != null) {
            const encrypted = await encryptAuthorization(unencryptedAuthorization);
            setEncryptedAuthorization((old) => ({
                ...old,
                [auth.type]: encrypted,
            }));
        }
        close();
    }, [auth.type, close, setEncryptedAuthorization, unencryptedAuthorization]);

    return (
        <div>
            {isAuthed(auth, unencryptedAuthorization) ? (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="success"
                    variant="outlined"
                    text={AUTH_TEXT}
                    icon={<Key />}
                    rightIcon={
                        <span className="bg-tag-success text-intent-success flex items-center rounded-[4px] p-1 font-mono text-xs uppercase leading-none">
                            Connected
                        </span>
                    }
                    onClick={toggleOpen}
                    active={isOpen}
                />
            ) : (
                <FernButton
                    className="w-full text-left"
                    size="large"
                    intent="danger"
                    variant="outlined"
                    text={AUTH_TEXT}
                    icon={<Key />}
                    rightIcon={
                        <span className="bg-tag-danger text-intent-danger flex items-center rounded-[4px] p-1 font-mono text-xs uppercase leading-none">
                            Connect
                        </span>
                    }
                    onClick={toggleOpen}
                    active={isOpen}
                />
            )}
            <FernCollapse isOpen={isOpen}>
                <div className="pt-4">
                    <div className="fern-dropdown">
                        <PlaygroundAuthorizationForm
                            auth={auth}
                            value={unencryptedAuthorization}
                            onChange={setUnencryptedAuthorization}
                            disabled={disabled}
                        />
                        <div className="flex items-center justify-between gap-2 p-4 pt-2">
                            <div className="t-muted text-xs">{SECURITY_HELPER}</div>
                            <FernButton text="Encrypt & Save" intent="primary" onClick={encryptAndClose} />
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

async function encryptAuthorization(auth: PlaygroundRequestFormAuth): Promise<PlaygroundRequestFormAuth> {
    const JSEncrypt = (await import("jsencrypt")).default;
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(getPublicKey());

    function encryptAuthorizationHeader(auth: string): string | boolean {
        if (auth.toLowerCase().startsWith("bearer ")) {
            const token = encrypt.encrypt(auth.slice(7));
            if (!token) {
                return false;
            }
            return `Bearer fern_${token}`;
        } else if (auth.toLowerCase().startsWith("basic ")) {
            const token = encrypt.encrypt(auth.slice(6));
            if (!token) {
                return false;
            }
            return `Basic fern_${token}`;
        }
        return `fern_${encrypt.encrypt(auth)}`;
    }

    return visitDiscriminatedUnion(auth, "type")._visit<PlaygroundRequestFormAuth>({
        bearerAuth: (bearerAuth) => {
            const token = encrypt.encrypt(bearerAuth.token);
            if (!token) {
                throw new Error("Failed to encrypt token");
            }
            return { type: "bearerAuth", token: `fern_${token}` };
        },
        header: (header) => {
            const headers = Object.fromEntries(
                Object.entries(header.headers)
                    .map(([key, value]) => [
                        key,
                        key.toLowerCase() === "authorization"
                            ? encryptAuthorizationHeader(value)
                            : `fern_${encrypt.encrypt(value)}`,
                    ])
                    .filter(([, value]) => value),
            );
            return { type: "header", headers };
        },
        basicAuth: (basicAuth) => {
            const username = encrypt.encrypt(basicAuth.username);
            const password = encrypt.encrypt(basicAuth.password);
            if (!username || !password) {
                throw new Error("Failed to encrypt username or password");
            }
            return {
                type: "basicAuth",
                username: `fern_${username}`,
                password: `fern_${password}`,
            };
        },
        _other: () => {
            throw new Error("Unknown authorization type");
        },
    });
}
