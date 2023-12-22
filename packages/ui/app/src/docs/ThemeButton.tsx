import { useMounted } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useTheme } from "next-themes";
import { MoonIcon } from "../commons/icons/MoonIcon";
import { SunIcon } from "../commons/icons/SunIcon";

export declare namespace ThemeButton {
    export interface Props {
        className?: string;
    }
}

export const ThemeButton: React.FC<ThemeButton.Props> = ({ className }) => {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useMounted();

    const IconToUse = mounted && resolvedTheme === "dark" ? MoonIcon : SunIcon;

    return (
        <button
            className={classNames("group flex w-9 items-center justify-center self-stretch", className)}
            onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
        >
            <IconToUse className="text-intent-default group-hover:text-text-primary-light group-hover:dark:text-text-primary-dark h-4 w-4 transition" />
        </button>
    );
};
