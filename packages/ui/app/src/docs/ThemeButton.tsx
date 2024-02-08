import { useMounted } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useTheme } from "next-themes";
import { Moon as MoonIcon, Sun as SunIcon } from "react-feather";
import { FernButton, FernButtonProps } from "../components/FernButton";

export declare namespace ThemeButton {
    export interface Props extends FernButtonProps {
        className?: string;
    }
}

export const ThemeButton: React.FC<ThemeButton.Props> = ({ className, ...props }) => {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useMounted();

    const IconToUse = mounted && resolvedTheme === "dark" ? MoonIcon : SunIcon;

    return (
        <FernButton
            {...props}
            className={classNames("group !ml-3", className)}
            onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
            rounded={true}
            buttonStyle="minimal"
            intent="primary"
            icon={
                <IconToUse className="text-intent-default dark:text-intent-default-dark group-hover:t-accent size-4 group-hover:transition" />
            }
        />
    );
};
