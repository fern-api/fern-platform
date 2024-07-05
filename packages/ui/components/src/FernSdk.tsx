import cn from "clsx";
import { useState } from "react";
import { objectKeys } from "ts-extras";
import { RemoteFontAwesomeIcon } from "./FontAwesomeIcon";

type FernSdkLanguage = "node" | "python" | "java";

const languageProps: Record<FernSdkLanguage, { name: string; icon: string; color?: string }> = {
  java: {
    name: "Java",
    icon: "fa-brands fa-java",
  },
  node: {
    name: "Node.js",
    icon: "fa-brands fa-node-js",
    color: "#5FA04E",
  },
  python: {
    name: "Python",
    icon: "fa-brands fa-python",
    color: "#3776AB",
  },
};

export const FernSdk: React.FC<{
  sdks: Partial<Record<FernSdkLanguage, { packageName: string }>>;
}> = ({ sdks }) => {
  const [activeLanguage, setActiveLanguage] = useState<FernSdkLanguage | null>(null);
  return (
    <div className="border rounded-lg">
      <div className="">
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
    </div>
  );
};
