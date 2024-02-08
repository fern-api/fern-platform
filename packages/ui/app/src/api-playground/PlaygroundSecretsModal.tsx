import { useCopyToClipboard } from "@fern-ui/react-commons";
import { ArrowRightIcon, Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC, useState } from "react";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernModal } from "../components/FernModal";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
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
        <FernTooltip
            open={wasJustCopied ? wasJustCopied : undefined}
            content={wasJustCopied ? "Copied!" : "Click to copy secret"}
        >
            <span
                className={classNames(
                    parentClassName,
                    "bg-tag-default hover:bg-tag-primary -mx-0.5 cursor-pointer rounded px-0.5 font-mono",
                )}
                onClick={copyToClipboard}
                {...props}
            >
                {obfuscateSecret(secret)}
            </span>
        </FernTooltip>
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
    const modal = (
        <FernModal isOpen={isOpen} onClose={onClose} className="relative w-96 rounded-lg p-4">
            <FernButton className="absolute right-2 top-2" variant="minimal" icon={<Cross1Icon />} onClick={onClose} />
            <h3 className="m-0 mb-2">Secrets</h3>
            <ul>
                {secrets.map((secret, idx) => (
                    <li key={idx} className="mb-2 flex items-center justify-between gap-2">
                        <span>
                            <SecretSpan secret={secret.token} />
                        </span>
                        <span>
                            <FernButtonGroup>
                                <FernButton
                                    variant="minimal"
                                    icon={<TrashIcon />}
                                    onClick={() => {
                                        setSecrets([...secrets.slice(0, idx), ...secrets.slice(idx + 1)]);
                                    }}
                                />
                                <FernButton
                                    variant="minimal"
                                    icon={<ArrowRightIcon />}
                                    onClick={() => {
                                        selectSecret(secret);
                                    }}
                                />
                            </FernButtonGroup>
                        </span>
                    </li>
                ))}
                <li className="flex gap-2">
                    <PasswordInputGroup
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
                        className="dark:text-dark bg-accent hover:bg-accent-primary-light/70 dark:hover:bg-accent-primary-dark/70 t-accent-contrast group flex h-[30px] items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                    >
                        Add
                    </button>
                </li>
            </ul>
        </FernModal>
    );

    return (
        <FernTooltipProvider skipDelayDuration={700} delayDuration={300}>
            {modal}
        </FernTooltipProvider>
    );
};
