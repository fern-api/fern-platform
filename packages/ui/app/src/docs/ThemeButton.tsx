import { FernButton, FernButtonProps } from "@fern-ui/components";
import { useMounted } from "@fern-ui/react-commons";
import cn from "clsx";

import { memo } from "react";
import { Moon as MoonIcon, Sun as SunIcon } from "react-feather";
import { useTheme, useToggleTheme } from "../atoms/theme";

export declare namespace ThemeButton {
    export interface Props extends FernButtonProps {
        className?: string;
    }
}

export const ThemeButton = memo(({ className, ...props }: ThemeButton.Props) => {
    const resolvedTheme = useTheme();
    const toggleTheme = useToggleTheme();
    const mounted = useMounted();

    const IconToUse = mounted && resolvedTheme === "dark" ? MoonIcon : SunIcon;

    return (
        <FernButton
            {...props}
            className={cn("fern-theme-button", className)}
            onClick={toggleTheme}
            rounded={true}
            variant="minimal"
            intent="primary"
            icon={<IconToUse className="fern-theme-button-icon" />}
        />
    );
});

ThemeButton.displayName = "ThemeButton";
