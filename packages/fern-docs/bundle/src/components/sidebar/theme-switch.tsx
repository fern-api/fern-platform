"use client";

import { useTheme } from "next-themes";
import type { FC } from "react";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button, FernDropdown } from "@fern-docs/components";
import { useMounted } from "@fern-ui/react-commons";

type ThemeSwitchProps = {
  lite?: boolean;
  className?: string;
};

const themeSwitchOptions = [
  { type: "value", value: "light", label: "Light", icon: <Sun /> },
  { type: "value", value: "dark", label: "Dark", icon: <Moon /> },
  { type: "value", value: "system", label: "System", icon: <Monitor /> },
] as const;

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { setTheme, theme = "system" } = useTheme();
  const mounted = useMounted();
  const selectedOption = themeSwitchOptions.find(
    (option) => option.value === (mounted ? theme : "light")
  );
  return (
    <FernDropdown
      className={className}
      options={themeSwitchOptions}
      onValueChange={setTheme}
      value={selectedOption?.value}
    >
      <Button variant="outline" size="sm">
        {selectedOption?.icon}
        {selectedOption?.label}
      </Button>
    </FernDropdown>
  );
};
