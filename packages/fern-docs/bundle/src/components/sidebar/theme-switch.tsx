"use client";

import { useTheme } from "next-themes";
import React from "react";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button, FernDropdown } from "@fern-docs/components";
import { useMounted } from "@fern-ui/react-commons";

const themeSwitchOptions = [
  { type: "value", value: "light", label: "Light", icon: <Sun /> },
  { type: "value", value: "dark", label: "Dark", icon: <Moon /> },
  { type: "value", value: "system", label: "System", icon: <Monitor /> },
] as const;

export function ThemeSwitch({ className }: { className?: string }) {
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
}

function findOrCreateThemeColorMetaTag() {
  const metaTags = document.head.querySelectorAll("meta[name='theme-color']");

  // remove all but the first meta tag
  if (metaTags.length > 1) {
    [...metaTags].slice(1).forEach((metaTag) => {
      metaTag.remove();
    });
  }

  let metaTag = metaTags[0] as HTMLMetaElement | undefined;
  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.name = "theme-color";
    document.head.appendChild(metaTag);
  }
  metaTag.media = "";
  return metaTag;
}

export function ThemeMetaTag({
  light,
  dark,
}: {
  light?: string;
  dark?: string;
}) {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const metaTag = findOrCreateThemeColorMetaTag();
    if (resolvedTheme === "light" && light) {
      metaTag.content = light;
    } else if (resolvedTheme === "dark" && dark) {
      metaTag.content = dark;
    } else {
      metaTag.remove();
    }
  }, [resolvedTheme, light, dark]);

  return null;
}
