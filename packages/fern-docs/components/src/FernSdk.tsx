import cn from "clsx";
import { arrayIncludes, objectKeys } from "ts-extras";
import { CopyToClipboardButton } from "./CopyToClipboardButton";
import { RemoteFontAwesomeIcon } from "./FontAwesomeIcon";

const languages = [
    "node",
    "python",
    "java",
    "ruby",
    "go",
    "csharp",
    "swift",
] as const;
type SdkLanguage = (typeof languages)[number];

type InstallCommand = (packageName: string) => string;

const languageProps: Record<
    SdkLanguage,
    {
        name: string;
        icon: string;
        installCommand: InstallCommand;
        color?: string;
    }
> = {
    java: {
        name: "Java",
        icon: "fa-brands fa-java",
        installCommand: (packageName: string) =>
            `implementation '${packageName}'`,
    },
    node: {
        name: "Node.js",
        icon: "fa-brands fa-node-js",
        color: "#5FA04E",
        installCommand: (packageName: string) => `npm install ${packageName}`,
    },
    python: {
        name: "Python",
        icon: "fa-brands fa-python",
        color: "#3776AB",
        installCommand: (packageName: string) => `pip install ${packageName}`,
    },
    ruby: {
        name: "Ruby",
        icon: "fa-solid fa-gem",
        color: "#CC342D",
        installCommand: (packageName: string) => `gem install ${packageName}`,
    },
    go: {
        name: "Go",
        icon: "fa-brands fa-golang",
        color: "#00ADD8",
        installCommand: (packageName: string) => `go get ${packageName}`,
    },
    csharp: {
        name: "C#",
        icon: "fa-brands fa-microsoft",
        color: "#68217A",
        installCommand: (packageName: string) =>
            `dotnet add package ${packageName}`,
    },
    swift: {
        name: "Swift",
        icon: "fa-brands fa-swift",
        color: "#F05138",
        installCommand: () => "Edit your Package.swift file",
    },
};

const FernSdkInstallCommand: React.FC<{
    installCommand: InstallCommand;
    packageName: string;
}> = ({ installCommand, packageName }) => {
    const command = installCommand(packageName);
    return (
        <>
            <pre>
                <code>
                    <span className="t-muted">$</span> {command}
                </code>
            </pre>
            <CopyToClipboardButton
                className="absolute top-2.5 right-2.5"
                content={command}
            />
        </>
    );
};

const normalizeLanguage = (language: string): SdkLanguage | undefined => {
    if (arrayIncludes(languages, language)) {
        return language;
    }

    switch (language) {
        case "js":
        case "ts":
        case "javascript":
        case "typescript":
        case "nodejs":
        case "ts-node":
            return "node";
        case "py":
            return "python";
        case "golang":
            return "go";
        default:
            return undefined;
    }
};

export const FernSdk: React.FC<{
    sdks: Partial<
        Record<
            SdkLanguage,
            {
                packageName: string;
                installCommand?: InstallCommand;
            }
        >
    >;
    language: string;
    onChange: (language: string) => void;
}> = ({ sdks, language, onChange }) => {
    const activeLanguage = normalizeLanguage(language);
    const activeSdk = activeLanguage && sdks[activeLanguage];
    return (
        <div className="border border-default rounded-lg overflow-hidden">
            <div className="bg-background">
                <div className="px-3 py-2 text-xs font-medium uppercase">
                    Client libraries
                </div>
                <div className="flex justify-center">
                    {objectKeys(sdks).map((lang, index) => {
                        const { icon, name, color } = languageProps[lang];
                        return (
                            <button
                                className={cn(
                                    "py-2 w-16 flex flex-col items-center gap-2 text-center border-b-2",
                                    activeLanguage === lang
                                        ? "border-primary"
                                        : "border-transparent"
                                )}
                                key={lang}
                                onClick={() => {
                                    onChange(lang);
                                }}
                            >
                                <RemoteFontAwesomeIcon
                                    className="mx-auto"
                                    key={index}
                                    color={color}
                                    icon={icon}
                                    size={6}
                                />
                                <div className="text-xs pb-0.5">{name}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="bg-background-tertiary-light px-3 py-4 dark:bg-background-tertiary-dark border-t border-default text-sm relative">
                {activeSdk ? (
                    <FernSdkInstallCommand
                        installCommand={
                            activeSdk.installCommand ??
                            languageProps[activeLanguage].installCommand
                        }
                        packageName={activeSdk.packageName}
                    />
                ) : (
                    <>
                        By default, these docs demonstrate using curl to
                        interact with the API over HTTP. Select one of our
                        official client libraries to see examples in code.
                    </>
                )}
            </div>
        </div>
    );
};
