import { FernButton, FernButtonProps } from "@fern-ui/components";
import { useMounted } from "@fern-ui/react-commons";
import cn from "clsx";
import { useTheme } from "next-themes";
import { Moon as MoonIcon, Sun as SunIcon } from "react-feather";

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
            className={cn("fern-theme-button", className)}
            onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
            rounded={true}
            variant="minimal"
            intent="primary"
            icon={<IconToUse className="fern-theme-button-icon" />}
        />
    );
};
