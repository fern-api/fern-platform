import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useTheme } from "@fern-ui/theme";
import dynamic from "next/dynamic";
import { MoonIcon } from "../commons/icons/MoonIcon";
import { SunIcon } from "../commons/icons/SunIcon";

export declare namespace ThemeButton {}

export const Core: React.FC = () => {
    const { theme, setTheme } = useTheme();

    if (theme == null) {
        return null;
    }

    return (
        <button
            className="group flex w-9 items-center justify-center self-stretch"
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
