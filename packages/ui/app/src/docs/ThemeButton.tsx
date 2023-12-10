import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useTheme } from "@fern-ui/theme";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MoonIcon } from "../commons/icons/MoonIcon";
import { SunIcon } from "../commons/icons/SunIcon";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace ThemeButton {
    export interface Props {
        className?: string;
    }
}

export const Core: React.FC<ThemeButton.Props> = ({ className }) => {
    const { docsDefinition } = useDocsContext();
    const { theme, setTheme } = useTheme(docsDefinition.config.colorsV3.type);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            className={classNames("group flex w-9 items-center justify-center self-stretch", className)}
            onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
            }}
        >
            {visitDiscriminatedUnion({ theme }, "theme")._visit({
                dark: () => (
                    <MoonIcon className="text-intent-default group-hover:text-text-primary-dark h-4 w-4 transition" />
                ),
                light: () => (
                    <SunIcon className="text-intent-default group-hover:text-text-primary-light h-4 w-4 transition" />
                ),
                _other: () => null,
            })}
        </button>
    );
};

export const ThemeButton = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});
