import cn from "clsx";
import { useState } from "react";
import { objectKeys } from "ts-extras";
import { RemoteFontAwesomeIcon } from "./FontAwesomeIcon";

type FernSdkLanguage = "node" | "python" | "java" | "ruby" | "go" | "c#" | "swift";

type InstallCommand = (packageName: string) => string;

const languageProps: Record<
    FernSdkLanguage,
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
        installCommand: (packageName: string) => `implementation '${packageName}'`,
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
    "c#": {
        name: "C#",
        icon: "fa-brands fa-microsoft",
        color: "#68217A",
        installCommand: (packageName: string) => `dotnet add package ${packageName}`,
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
    return (
        <pre>
            <code>
                <span className="t-muted">$</span> {installCommand(packageName)}
            </code>
        </pre>
    );
};

export const FernSdk: React.FC<{
    sdks: Partial<
        Record<
            FernSdkLanguage,
            {
                packageName: string;
                installCommand?: InstallCommand;
            }
        >
    >;
}> = ({ sdks }) => {
    const [activeLanguage, setActiveLanguage] = useState<FernSdkLanguage | null>(null);
    const activeSdk = activeLanguage && sdks[activeLanguage];
    return (
        <div className="border border-default rounded-lg overflow-hidden">
            <div className="bg-background">
                <div className="px-3 py-2 text-xs font-medium uppercase">Client libraries</div>
                <div className="flex justify-center">
                    {objectKeys(sdks).map((language, index) => {
                        const { icon, name, color } = languageProps[language];
                        return (
                            <button
                                className={cn(
                                    "py-2 w-16 flex flex-col items-center gap-2 text-center border-b-2",
                                    activeLanguage === language ? "border-primary" : "border-transparent",
                                )}
                                key={language}
                                onClick={() => {
                                    setActiveLanguage(language);
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
            <div className="bg-background-tertiary-light px-3 py-4 dark:bg-background-tertiary-dark border-t border-default text-sm">
                {activeSdk ? (
                    <FernSdkInstallCommand
                        installCommand={activeSdk.installCommand ?? languageProps[activeLanguage].installCommand}
                        packageName={activeSdk.packageName}
                    />
                ) : (
                    <>
                        By default, these docs demonstrate using curl to interact with the API over HTTP. Select one of
                        our official client libraries to see examples in code.
                    </>
                )}
            </div>
        </div>
    );
};
