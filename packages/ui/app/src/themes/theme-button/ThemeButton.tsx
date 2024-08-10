import { FernButton, FernButtonProps } from "@fern-ui/components";
import { useMounted } from "@fern-ui/react-commons";
import * as Popover from "@radix-ui/react-popover";
import cn from "clsx";
import { memo, useState } from "react";
import { Monitor, Moon, Sun } from "react-feather";
import { useSetSystemTheme, useTheme, useToggleTheme } from "../../atoms";

export declare namespace ThemeButton {
    export interface Props extends FernButtonProps {
        className?: string;
    }
}

export const ThemeButton = memo(({ className, ...props }: ThemeButton.Props) => {
    const resolvedTheme = useTheme();
    const toggleTheme = useToggleTheme();
    const setSystemTheme = useSetSystemTheme();
    const mounted = useMounted();
    const [isOpen, setOpen] = useState(false);

    const IconToUse = mounted && resolvedTheme === "dark" ? Moon : Sun;

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setOpen(false);
                }
            }}
        >
            <Popover.Trigger asChild>
                <FernButton
                    {...props}
                    className={cn("fern-theme-button", className)}
                    onClick={toggleTheme}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setOpen(true);
                    }}
                    rounded={true}
                    variant="minimal"
                    intent="primary"
                    icon={<IconToUse className="fern-theme-button-icon !size-icon max-lg:!size-icon-md" />}
                    title="toggle theme"
                />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content sideOffset={5} side="bottom" align="center">
                    <FernButton
                        onClick={() => {
                            setSystemTheme();
                            setOpen(false);
                        }}
                        variant="outlined"
                        intent="none"
                        icon={<Monitor className="fern-theme-button-icon" />}
                        text="Auto"
                        title="set system theme"
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
});

ThemeButton.displayName = "ThemeButton";
