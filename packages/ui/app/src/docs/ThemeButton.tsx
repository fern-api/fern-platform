import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { MoonIcon } from "../commons/icons/MoonIcon";
import { SunIcon } from "../commons/icons/SunIcon";

// TODO: Place elsewhere
type Theme = "dark" | "light";

export declare namespace ThemeButton {
    export interface Props {
        theme: Theme;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    }
}

export const ThemeButton: React.FC<ThemeButton.Props> = ({ theme, onClick }) => {
    return (
        <button className="group flex w-9 items-center justify-center self-stretch" onClick={onClick}>
            {visitDiscriminatedUnion({ theme }, "theme")._visit({
                dark: () => (
                    <MoonIcon className="text-intent-default group-hover:text-textPrimary h-4 w-4 transition" />
                ),
                light: () => (
                    <SunIcon className="text-intent-default group-hover:text-textPrimary h-4 w-4 transition" />
                ),
                _other: () => null,
            })}
        </button>
    );
};
