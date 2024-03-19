import { useMounted } from "@fern-ui/react-commons";
import cn from "clsx";
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
            className={cn("group !ml-3", className)}
            onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
            rounded={true}
            variant="minimal"
            intent="primary"
            icon={<IconToUse className="text-intent-default group-hover:t-accent size-4 transition-colors" />}
        />
    );
};
