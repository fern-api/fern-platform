import { FernButton, FernButtonGroup, FernModal, FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import { ArrowRightIcon, Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { FC, useState } from "react";
import { PasswordInputGroup } from "./PasswordInputGroup.js";
import { obfuscateSecret } from "./utils.js";

export interface SecretBearer {
    type: "bearer";
    token: string;
}

interface PlaygroundSecretsModalProps {
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
                className={cn(
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

const playgroundFormSecretsAtom = atomWithStorage<SecretBearer[]>("api-playground-secrets-alpha", []);
export const PlaygroundSecretsModal: FC<PlaygroundSecretsModalProps> = ({ onClose, selectSecret, isOpen }) => {
    const [secrets, setSecrets] = useAtom(playgroundFormSecretsAtom);

    const [value, setValue] = useState<string>("");
    const modal = (
        <FernModal isOpen={isOpen} onClose={onClose} className="relative w-96 rounded-lg p-4">
            <FernButton className="absolute right-2 top-2" variant="minimal" icon={<Cross1Icon />} onClick={onClose} />
            <h3 className="m-0 mb-4">Secrets</h3>
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
                        className="flex-1"
                    />
                    <FernButton
                        variant="filled"
                        intent="primary"
                        onClick={() => {
                            setSecrets([...secrets, { type: "bearer", token: value }]);
                            setValue("");
                        }}
                    >
                        Add
                    </FernButton>
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
