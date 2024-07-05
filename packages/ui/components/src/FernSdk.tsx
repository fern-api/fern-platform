import cn from "clsx";
import { useState } from "react";
import { objectKeys } from "ts-extras";
import { RemoteFontAwesomeIcon } from "./FontAwesomeIcon";

type FernSdkLanguage = "node" | "python" | "java";

const languageProps: Record<
  FernSdkLanguage,
  { name: string; icon: string; installCommand: (packageName: string) => string; color?: string }
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
};

const FernSdkInstallCommand: React.FC<{ children: string }> = ({ children }) => {
  const isOneLine = children.split("\n").filter(Boolean).length === 1;
  return (
    <pre>
      <code>
        {isOneLine && (
          <>
            <span className="t-muted">$</span>{" "}</>
        )}
        {children}
      </code>
    </pre>
  );
};

export const FernSdk: React.FC<{
  sdks: Partial<Record<FernSdkLanguage, { packageName: string }>>;
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
                  "py-2 flex flex-col gap-2 text-center border-b-2",
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
                <div className="text-xs">{name}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-background-tertiary-light px-3 py-4 dark:bg-background-tertiary-dark border-t border-default">
        {activeSdk ? (
          <FernSdkInstallCommand>
            {languageProps[activeLanguage].installCommand(activeSdk.packageName)}
          </FernSdkInstallCommand>
        ) : (
          <div className="text-sm">
            By default, these docs demonstrate using curl to interact with the API over HTTP. Select one of
            our official client libraries to see examples in code.
          </div>
        )}
      </div>
    </div>
  );
};
