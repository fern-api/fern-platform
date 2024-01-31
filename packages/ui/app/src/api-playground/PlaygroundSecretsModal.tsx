import { Button, ButtonGroup, mergeRefs, Tooltip } from "@blueprintjs/core";
import { ArrowRight, Cross, Trash } from "@blueprintjs/icons";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import classNames from "classnames";
import { FC, useState } from "react";
import { FernModal } from "../components/FernModal";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { obfuscateSecret } from "./utils";

export interface SecretBearer {
    type: "bearer";
    token: string;
}

interface PlaygroundSecretsModalProps {
    secrets: SecretBearer[];
    setSecrets: (secrets: SecretBearer[]) => void;
    selectSecret: (secret: SecretBearer) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const SecretSpan: FC<{ secret: string } & React.HTMLAttributes<HTMLSpanElement>> = ({
    secret,
    className: parentClassName,
    ...props
}) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(secret);
    return (
        <Tooltip
            isOpen={wasJustCopied}
            content={"Copied!"}
            minimal={true}
            compact={true}
            placement="top"
            renderTarget={({ ref: refOuter, isOpen: copiedIsOpen, ...propsOuter }) => (
                <Tooltip
                    disabled={copiedIsOpen}
                    content={"Click to copy secret"}
                    minimal={true}
                    compact={true}
                    placement="top"
                    targetProps={propsOuter}
                    renderTarget={({ ref: refInner, isOpen, className, ...propsInner }) => (
                        <span
                            ref={mergeRefs(refOuter, refInner)}
                            {...propsInner}
                            className={classNames(
                                parentClassName,
                                className,
                                "bg-tag-default-light dark:bg-tag-default-dark hover:bg-tag-primary hover:dark:bg-tag-primary-dark -mx-0.5 cursor-pointer rounded px-0.5 font-mono",
                            )}
                            onClick={copyToClipboard}
                            {...props}
                        >
                            {obfuscateSecret(secret)}
                        </span>
                    )}
                />
            )}
        />
    );
};

export const PlaygroundSecretsModal: FC<PlaygroundSecretsModalProps> = ({
    secrets,
    setSecrets,
    onClose,
    selectSecret,
    isOpen,
}) => {
    const [value, setValue] = useState<string>("");
    return (
        <FernModal isOpen={isOpen} onClose={onClose} className="relative w-96 rounded-lg p-4">
            <Button className="absolute right-2 top-2" minimal icon={<Cross />} onClick={onClose} />
            <h3 className="m-0 mb-2">Secrets</h3>
            <ul>
                {secrets.map((secret, idx) => (
                    <li key={idx} className="mb-2 flex items-center justify-between gap-2">
                        <span>
                            <SecretSpan secret={secret.token} />
                        </span>
                        <span>
                            <ButtonGroup minimal>
                                <Button
                                    icon={<Trash />}
                                    onClick={() => {
                                        setSecrets([...secrets.slice(0, idx), ...secrets.slice(idx + 1)]);
                                    }}
                                />
                                <Button
                                    icon={<ArrowRight />}
                                    onClick={() => {
                                        selectSecret(secret);
                                    }}
                                />
                            </ButtonGroup>
                        </span>
                    </li>
                ))}
                <li className="flex gap-2">
                    <PasswordInputGroup
                        fill={true}
                        onValueChange={setValue}
                        value={value}
                        autoComplete="off"
                        data-1p-ignore="true"
                    />
                    <button
                        onClick={() => {
                            setSecrets([...secrets, { type: "bearer", token: value }]);
                            setValue("");
                        }}
                        className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/70 dark:hover:bg-accent-primary-dark/70 text-accent-primary-contrast dark:text-accent-primary-dark-contrast group flex h-[30px] items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                    >
                        Add
                    </button>
                </li>
            </ul>
        </FernModal>
    );
};
