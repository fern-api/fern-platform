import { Command } from "cmdk";
import { Laptop, Moon, Sun } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const CommandGroupTheme = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof Command.Group> & {
        setTheme?: (theme: "light" | "dark" | "system") => void;
    }
>(({ setTheme, ...props }, ref) => {
    if (setTheme == null) {
        return false;
    }

    return (
        <Command.Group heading="Theme" ref={ref} {...props}>
            <Command.Item value="light" onSelect={() => setTheme("light")} keywords={["light mode", "light theme"]}>
                <Sun />
                Light
            </Command.Item>
            <Command.Item value="dark" onSelect={() => setTheme("dark")} keywords={["dark mode", "dark theme"]}>
                <Moon />
                Dark
            </Command.Item>
            <Command.Item value="system" onSelect={() => setTheme("system")} keywords={["system mode", "system theme"]}>
                <Laptop />
                System
            </Command.Item>
        </Command.Group>
    );
});

CommandGroupTheme.displayName = "CommandGroupTheme";
